import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import {prisma} from "../../lib/prisma.ts";
import jwt from "jsonwebtoken"
process.loadEnvFile()

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


export const login = async (req: Request, res: Response) => {
    if (!process.env.JWT_SECRET) 
        throw new Error("JWT_SECRET not set")
    
    if (req.user) {
        const token = jwt.sign(req.user, process.env.JWT_SECRET, { expiresIn: "1d"})
        return res.status(200).json({
            data: { token }
        })
    }
    res.status(500).json({
        error: { msg: "req.user not set"}
    })
}