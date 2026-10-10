import { type Request, type Response, type NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"
process.loadEnvFile()

export default function isAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token)
        return res.status(401).json({
            error: {message: "missing auth header"}
        })
    
    if (!process.env.JWT_SECRET)
        return res.status(500).json({
            error: { message: "JWT_SECRET not set"}
        })

    try {
        req.decodedToken = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload
        next()
    }
    catch(e) {
        res.status(401).json({
            error: e
        })
    }
}