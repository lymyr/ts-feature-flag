import { type Request, type Response } from "express"

export const getFlags = (req: Request, res: Response) => {
    res.json({
        data: {
            flags: req.flags
        }
    })
}