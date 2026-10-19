import * as z from "zod"
import { type Request, type Response, type NextFunction } from "express"
import { Occupation, Operator, UserAttribute } from "../../generated/prisma/enums.ts"
import { prisma } from "../../lib/prisma.ts"
import bcrypt from "bcryptjs"

export class AccountValidation {
    private static userAttr = {
        username: z.string().trim()
            .min(3, {error: "username must be at least 3 characters", abort: true})
            .max(20, {error: "username must not exceed 20 characters", abort: true}),
        password: z.string().trim().min(3, {error: "password must be at least 3 characters long"}),
        confirmPassword: z.string().trim(),
        occupation: z.enum(Object.values(Occupation).filter((o) => o != "admin")).optional(),
        powerLevel: z.preprocess((val) => {return typeof val == "string" && val.trim() === "" ? NaN : val}, z.coerce.number().int().gte(0).optional())
    }

    private static accSchema = z.object({...this.userAttr})
        .refine((body) => body.password === body.confirmPassword, {
            error: "passwords do not match",
            abort: true,
            path: ["confirmPassword"]
        })
        .refine(async (body) => {
            const user = await prisma.user.findUnique({where: {username: body.username}})
            if (user)
                return false
            return true
        }, {
            error: "username already exists",
            path:["username"]
        })

    private static loginSchema = z.object({ 
        username: this.userAttr.username, 
        password: this.userAttr.password 
    })

    static register = async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.accSchema.safeParseAsync(req.body);
        if (!result.success)
            return res.status(400).json(z.flattenError(result.error))
        req.body = result.data
        next()
    }

    static login = async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.loginSchema
            .refine(async (body) => {
                const user = await prisma.user.findUnique({where: {username: body.username }})
                if (!user)
                    return false

                const match = await bcrypt.compare(body.password, user.password)
                delete (user as {password?: string}).password
                
                if (match) {
                    req.user = user
                    return true
                }
                return false
                
            }, {
                error: "invalid login credentials"
            })
            .safeParseAsync(req.body);
        if (!result.success)
            return res.status(401).json(z.flattenError(result.error))
        
        req.body = result.data
        next()
    }
}


export class FlagValidation {
    private static idSchema = z.object({
        id: z.coerce.number().int().gte(0)
    })

    private static flagSchema = z.object({
        name: z.string().min(1).max(25),
        isEnabled: z.boolean()
    })

    static validateFlagId = async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.idSchema
            .refine(async (param) => {
                const flag = await prisma.featureFlag.findUnique({ where: { id: param.id }})
                if (!flag)
                    return false
                req.flag = flag
                return true
            }, {error: "Feature flag not found"})
            .safeParseAsync({id: req.params.flagId})
        if (!result.success) {
            let status = 400;
            if (result.error.issues[0] && result.error.issues[0].message == "Feature flag not found")
                status = 404
            return res.status(status).json(z.flattenError(result.error))
        }

        next()
    }

    static validateFlag = async (req: Request, res: Response, next: NextFunction) => {
        const fs = req.method == "POST" ? 
            this.flagSchema.superRefine(async (body, ctx) => {
                const flags = await prisma.featureFlag.findMany({ where: { name: body.name }})
                if (flags.length > 0)
                    ctx.addIssue({
                        code: "custom",
                        message: "Flag name already taken",
                        input: body.name,
                        path: ["name"]
                    })
            })
            : this.flagSchema

        const result = await fs.safeParseAsync(req.body)
        if (!result.success) 
            return res.status(400).json(z.flattenError(result.error))

        next()
    }
}


export class RuleValidation {
    private static rulesSchema = z.object({
        rules: z.array(z.object({
            value: z.union([
                z.preprocess(
                    (val) => (typeof val === "string" && val.trim() === "" ? NaN : val), 
                    z.coerce.number().int().gte(0)
                ), 
                z.string().trim().max(50)
            ]).nonoptional(),
            operator: z.enum(Object.values(Operator)).nonoptional(),
            attribute: z.enum(Object.values(UserAttribute)).nonoptional()
        }))
    }).superRefine((body, ctx) => {
        outer: for (let i = 0; i < body.rules.length; i++) {
            const rule = body.rules[i] as NonNullable<typeof body.rules[typeof i]>
            if (rule.attribute == "powerLevel" && ["endsWith", "startsWith"].includes(rule.operator)) {
                ctx.addIssue({
                    code: "custom",
                    message: "Number type cannot be used with endsWith and startsWith",
                    path: [`${i}`]
                })
            }
            else if (typeof rule.value == "string" && ["greaterThan", "lessThan"].includes(rule.operator)) {
                ctx.addIssue({
                    code: "custom",
                    message: "String type cannot be used with greaterThan and lessThan",
                    path: [`${i}`]
                })
            }
            else if (rule.attribute == "powerLevel" && typeof rule.value == "string") {
                ctx.addIssue({
                    code: "custom",
                    message: "String values cannot be used on power level",
                    path: [`${i}`]
                })
            }
            else if (rule.attribute == "occupation") {
                const value = rule.value as string
                const occupations = Object.values(Occupation).filter((o) => o != "admin") as string[]
                if (!occupations.includes(value))
                    ctx.addIssue({
                        code: "custom",
                        message: `Invalid occupation. Expected: ${occupations.join(" | ")}`
                    })
                else if (!(rule.operator == "equal" || rule.operator == "notEqual"))
                    ctx.addIssue({
                        code: "custom",
                        message: `occupation attribute can only be used with equal and not equal operator`
                    })
            }

            for (let j = i + 1; j < body.rules.length; j++) {
                if (rule.value == body.rules[j]?.value && rule.operator == body.rules[j]?.operator) {
                    ctx.addIssue({
                        code: "custom",
                        message: "Duplicate rule",
                        path: [`${i}`],
                        input: rule.value
                    })
                    break outer;
                }
                    
            }
        }
    })

    static validateRule = (req: Request, res: Response, next: NextFunction) => {
        const result = this.rulesSchema
            .refine((body) => {
                for (let i = 0; i < body.rules.length; i++) {
                    if (req.body.rules[i].attribute == "occupation") {
                        const rule = body.rules[i]?.value as string
                        const occupations = Object.values(Occupation) as string[]
                        if (!occupations.includes(rule)) 
                            return false
                    }
                }
                return true

            }, {error: "invalid occupation value"})
            .safeParse(req.body)

        if (!result.success)
            return res.status(400).json(z.flattenError(result.error))

        next()
    }
}