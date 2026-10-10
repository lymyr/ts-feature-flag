import { type Request, type Response } from "express"
import { prisma } from "../../lib/prisma.ts"

export const createFlag = async (req: Request, res: Response) => {
    const flag = await prisma.featureFlag.create({
        data: {
            name: req.body.name,
            isEnabled: req.body.isEnabled,
            attribute: req.body.attribute
        }
    })

    res.status(201).json({
        data: {
            flag
        }
    })
}

export const updateFlag = async (req: Request, res: Response) => {
    if (!req.flagId)
        return res.status(500).json({error: {message: "req.flagId is not set"}})
    
    const flag = await prisma.featureFlag.update({
        where: { id: req.flagId },
        data: {
            name: req.body.name,
            isEnabled: req.body.isEnabled,
            attribute: req.body.attribute
        }
    })

    res.json({
        data: {
            flag
        }
    })
}

export const deleteFlag = async (req: Request, res:Response) => {
    if (!req.flagId)
        return res.status(500).json({error: {message: "req.flagId is not set"}})

    const flag = await prisma.featureFlag.delete({
        where: {
            id: req.flagId
        }
    })

    res.json({
        data: {
            flag
        }
    })
}

export const getFlags = async (req: Request, res: Response) => {
    const flags = await prisma.featureFlag.findMany({ orderBy: { name: "asc" }})

    res.json({
        data: {
            flags
        }
    })
}

export const getFlag = async (req: Request, res: Response) => {
    if (!req.flagId)
        return res.status(500).json({error: {message: "req.flagId is not set"}})

    const flag = await prisma.featureFlag.findUnique({ 
        where: { id: req.flagId },
        include: {
            rules: true
        }
    })

    res.json({
        data: {
            flag
        }
    })
}