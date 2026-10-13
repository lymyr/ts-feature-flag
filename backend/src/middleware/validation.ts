import * as z from "zod"
import { type Request, type Response, type NextFunction } from "express"
import { Occupation, Operator } from "../../generated/prisma/enums.ts"
import { prisma } from "../../lib/prisma.ts"
import bcrypt from "bcryptjs"

export class AccountValidation {
    private static userAttr = {
        username: z.string().trim()
            .min(3, {error: "username must be at least 3 characters", abort: true})
            .max(20, {error: "username must not exceed 20 characters", abort: true}),
        password: z.string().trim().min(3, {error: "password must be at least 3 characters long"}),
        confirmPassword: z.string().trim(),
        occupation: z.enum(Object.values(Occupation).filter((o) => o != "admin"))
            .optional(),
        powerLevel: z.coerce.number().int().gte(0).optional()
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
}


export class RuleValidation {
    private static rulesSchema = z.object({
        rules: z.array(z.object({
            value: z.union([z.coerce.number().int().gte(0), z.string().trim().min(1).max(50)]),
            operator: z.enum(Object.values(Operator))
        }))
    }).superRefine((body, ctx) => {
        outer: for (let i = 0; i < body.rules.length; i++) {
            const rule = body.rules[i] as NonNullable<typeof body.rules[typeof i]>
            if (typeof rule.value == "number" && ["endsWith", "startsWith"].includes(rule.operator)) {
                ctx.addIssue({
                    code: "custom",
                    message: "number type cannot be used with endsWith and startsWith"
                })
            }
            else if (typeof rule.value == "string" && ["greaterThan", "lessThan"].includes(rule.operator)) {
                ctx.addIssue({
                    code: "custom",
                    message: "string type cannot be used with greaterThan and lessThan"
                })
            }

            for (let j = i + 1; j < body.rules.length; j++) {
                if (rule.value == body.rules[j]?.value && rule.operator == body.rules[j]?.operator) {
                    ctx.addIssue({
                        code: "custom",
                        message: "duplicate rule",
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
                if (req.flag?.attribute == "occupation") {
                    for (let i = 0; i < body.rules.length; i++) {
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