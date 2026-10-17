import { type Request, type Response, type NextFunction } from "express"
import { prisma } from "../../lib/prisma.ts"

export default async (req: Request, res: Response, next: NextFunction) => {
    req.flags = await getFlags(req.decodedToken)
    next()
}

export async function getFlags(user: Request['decodedToken']): Promise<Request['flags']> {
    if (user.occupation == 'admin') {
        const flags = await prisma.featureFlag.findMany({orderBy: { name: "asc"}})
        return flags
    }

    const flags = await prisma.featureFlag.findMany({
        where: {
            isEnabled: true
        },
        include: {
            rules: true
        },
        orderBy: { name: "asc"}
    })

    
    const filteredFlags: Request['flags'] = [];

    for (const flag of flags) {
        let match = true
        for (const rule of flag.rules) {
            if (rule.operator == "equal") {
                if (rule.value != user[rule.attribute]) {
                    match = false
                    break
                }     
            }
            else if (rule.operator == "notEqual") {
                if (rule.value == user[rule.attribute]) {
                    match = false
                    break
                }
            }
            else if (rule.operator == "lessThan") {
                if (Number.parseInt(rule.value) <= Number.parseInt(user[rule.attribute])) {
                    match = false
                    break
                }
            }
            else if (rule.operator == "greaterThan") {
                if (Number.parseInt(rule.value) >= Number.parseInt(user[rule.attribute])){
                    match = false
                    break
                }
            }
            else if (rule.operator == "startsWith" || rule.operator == "endsWith") {
                const ruleValueArr = rule.value.split("")
                const userValueArr = user[rule.attribute].split("")
                if (ruleValueArr.length <= userValueArr.length) {
                    if (rule.operator == "startsWith") {
                        for (let i = 0; i < ruleValueArr.length; i++) {
                            if (ruleValueArr[i] != userValueArr[i]) {
                                match = false;
                                break
                            }
                        }
                    }
                    else if (rule.operator == "endsWith") {
                        for (let i = 0; i < ruleValueArr.length; i++) {
                            if (ruleValueArr[i] != userValueArr[userValueArr.length-ruleValueArr.length + i]) {
                                match = false;
                                break
                            }
                        }
                    }
                }
            }
        }

        if (match) {
            // oxlint-disable-next-line no-unused-vars
            const {rules, ...noRulesFlag} = flag
            filteredFlags.push(noRulesFlag)
        }
    }

    return filteredFlags
}