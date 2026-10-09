import { type Request, type Response } from "express"

export const basic = (req: Request, res: Response) => {
 res.json({msg: "hello"})
}