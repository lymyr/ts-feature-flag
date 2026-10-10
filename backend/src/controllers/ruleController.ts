import { type Request, type Response } from "express"
import { prisma } from "../../lib/prisma.ts"

// kinda lazy to implement frontend if i limit rules to...
// one by one update ~n~
export const createUpdateRules = async (req: Request, res: Response) => {
    if (!req.flagId)
        throw new Error("flagId not set")

    const tasks = req.body.rules.length > 0 ? 
        [
            prisma.rule.deleteMany({ where: { flagId: req.flagId }}),
            prisma.rule.createManyAndReturn({
                data: req.body.rules.map((r: object) => {
                    return {...r, flagId: req.flagId}
                }),
            })
        ] :
        [
            prisma.rule.deleteMany({ where: { flagId: req.flagId }})
        ]

    const [, rules] = await prisma.$transaction(tasks)

    res.status(201).json({
        data: {
            rules: req.body.rules.length > 0 ? rules : []
        }
    })
}