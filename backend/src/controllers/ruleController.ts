import { type Request, type Response } from "express"
import { prisma } from "../../lib/prisma.ts"

// kinda lazy to implement frontend if i limit rules to...
// one by one update ~n~
export const createUpdateRules = async (req: Request, res: Response) => {
    if (!req.flag)
        throw new Error("flagId not set")

    const flag = req.flag
    const tasks = req.body.rules.length > 0 ? 
        [
            prisma.rule.deleteMany({ where: { flagId: flag.id }}),
            prisma.rule.createManyAndReturn({
                data: req.body.rules.map((r: object) => {
                    const rule = {...r, flagId: flag.id} as {id?: string | number}
                    delete rule.id
                    return rule
                }),
            })
        ] :
        [
            prisma.rule.deleteMany({ where: { flagId: flag.id }})
        ]

    const [, rules] = await prisma.$transaction(tasks)

    res.status(201).json({
        data: {
            rules: req.body.rules.length > 0 ? rules : []
        }
    })
}