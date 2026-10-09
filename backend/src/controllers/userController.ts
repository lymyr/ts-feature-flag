import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import {prisma} from "../../lib/prisma.ts"

export const register = async (req: Request, res: Response) => {
    const hashed = await bcrypt.hash(req.body.password, 10)
    await prisma.user.create({
        data: {
            username: req.body.username,
            password: hashed,
            occupation: req.body.occupation,
            powerLevel: req.body.powerLevel
        }
    })
    
    res.status(201).send(200)
}