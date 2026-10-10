import { type Request, type Response, type NextFunction } from "express";

export default function isAdmin(req: Request, res: Response, next: NextFunction) {
    const user = req.decodedToken as typeof req.user
    if (!user)
        throw new Error("req.decodedToken not set")

    if (user.occupation != "admin")
        return res.status(403).json({
            error: {
                message: "resource is available to admins only"
            }
        })
    next()
}