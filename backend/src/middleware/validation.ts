import * as z from "zod"
import { type Request, type Response, type NextFunction } from "express"
import { Occupation } from "../../generated/prisma/enums.ts"
import { prisma } from "../../lib/prisma.ts"

export class AccountValidation {
    private static userAttr = {
        username: z.string().trim()
            .min(3, {error: "username must be at least 3 characters"})
            .max(20, {error: "username must not exceed 20 characters"}),
        password: z.string().trim().min(3, {error: "password must be at least 3 characters long"}),
        confirmPassword: z.string().trim(),
        occupation: z.enum(Object.values(Occupation))
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
}