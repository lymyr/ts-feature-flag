import * as z from "zod"
import { type Request, type Response, type NextFunction } from "express"
import { Occupation } from "../../generated/prisma/enums.ts"
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
    }).refine(async (param) => {
        const flag = await prisma.featureFlag.findUnique({ where: { id: param.id }})
        if (!flag)
            return false
        return true
    }, {error: "Feature flag not found"})

    static id = async (req: Request, res: Response, next: NextFunction) => {
        const result = await this.idSchema.safeParseAsync({id: req.params.flagId})
        if (!result.success) {
            let status = 400;
            if (result.error.issues[0] && result.error.issues[0].message == "Feature flag not found")
                status = 404
            return res.status(status).json(z.flattenError(result.error))
        }

        req.flagId = result.data.id
        next()
    }
}