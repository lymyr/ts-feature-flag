import { test, vi, describe, expect } from "vitest";
import { getFlags } from "../../src/middleware/filterFlag";
import { prisma } from "../../lib/prisma";
import { Occupation, Operator, UserAttribute } from "../../generated/prisma/enums";

type flag = {
    isEnabled: boolean;
    rules: rule[]
}

type rule = {
    attribute: UserAttribute;
    value: string;
    operator: Operator
}

type user = {
    username: string,
    occupation: Occupation,
    powerLevel: number
}

describe("matching flags", () => {
    test("startsWith operation", async () => {
        const user: user = {
            username: "luffy",
            occupation: "citizen",
            powerLevel: 500
        }
        const flag: flag = {
            isEnabled: true,
            rules: [
                {
                    attribute: "username",
                    value: "lu",
                    operator: "startsWith",
                },
            ]
        }
        vi.spyOn(prisma.featureFlag, "findMany").mockResolvedValueOnce([flag] as any)
        const filteredFlags = await getFlags(user)
        expect(filteredFlags).toHaveLength(1)
    })

    test("endsWith operation", async () => {
        const user: user = {
            username: "bluffy",
            occupation: "citizen",
            powerLevel: 500
        }
        const flag: flag = {
            isEnabled: true,
            rules: [
                {
                    attribute: "username",
                    value: "ffy",
                    operator: "endsWith",
                },
            ]
        }
        vi.spyOn(prisma.featureFlag, "findMany").mockResolvedValueOnce([flag] as any)
        const filteredFlags = await getFlags(user)
        expect(filteredFlags).toHaveLength(1)
    })

    test("equal operation", async () => {
        const user: user = {
            username: "luffy",
            occupation: "citizen",
            powerLevel: 500
        }
        const flag: flag = {
            isEnabled: true,
            rules: [
                {
                    attribute: "username",
                    value: "luffy",
                    operator: "equal",
                },
            ]
        }
        vi.spyOn(prisma.featureFlag, "findMany").mockResolvedValueOnce([flag] as any)
        const filteredFlags = await getFlags(user)
        expect(filteredFlags).toHaveLength(1)
    })

    test("greaterThan operation", async () => {
        const user: user = {
            username: "kakarot",
            occupation: "citizen",
            powerLevel: 9000
        }
        const flag: flag = {
            isEnabled: true,
            rules: [
                {
                    attribute: "powerLevel",
                    value: "8999",
                    operator: "greaterThan",
                },
            ]
        }
        vi.spyOn(prisma.featureFlag, "findMany").mockResolvedValueOnce([flag] as any)
        const filteredFlags = await getFlags(user)
        expect(filteredFlags).toHaveLength(1)
    })

    test("lessThan operation", async () => {
        const user: user = {
            username: "weak dude",
            occupation: "citizen",
            powerLevel: 5
        }
        const flag: flag = {
            isEnabled: true,
            rules: [
                {
                    attribute: "powerLevel",
                    value: "6",
                    operator: "lessThan",
                },
            ]
        }
        vi.spyOn(prisma.featureFlag, "findMany").mockResolvedValueOnce([flag] as any)
        const filteredFlags = await getFlags(user)
        expect(filteredFlags).toHaveLength(1)
    })

    test("multiple rules", async () => {
        const user: user = {
            username: "kakarot",
            occupation: "citizen",
            powerLevel: 9000
        }
        const flag: flag = {
            isEnabled: true,
            rules: [
                {
                    attribute: "occupation",
                    value: "citizen",
                    operator: "equal",
                },
                {
                    attribute: "powerLevel",
                    value: "8999",
                    operator: "greaterThan",
                },
            ]
        }
        vi.spyOn(prisma.featureFlag, "findMany").mockResolvedValueOnce([flag] as any)
        const filteredFlags = await getFlags(user)
        expect(filteredFlags).toHaveLength(1)
    })

    test("notEqual operation", async () => {
        const user: user = {
            username: "no match",
            occupation: "citizen",
            powerLevel: 500
        }
        const flag: flag = {
            isEnabled: true,
            rules: [
                {
                    attribute: "occupation",
                    value: "pirate",
                    operator: "notEqual",
                }
            ]
        }
        vi.spyOn(prisma.featureFlag, "findMany").mockResolvedValueOnce([flag] as any)
        const filteredFlags = await getFlags(user)
        expect(filteredFlags).toHaveLength(1)
    })

    test("return all flags if admin", async () => {
        const user: user = {
            username: "whis",
            occupation: "admin",
            powerLevel: 1
        }
        const flags: flag[] = [
            {
                isEnabled: true,
                rules: [
                    {
                        attribute: "username",
                        value: "luffy",
                        operator: "equal",
                    }
                ]
            },
            {
                isEnabled: true,
                rules: [
                    {
                        attribute: "powerLevel",
                        value: "7568",
                        operator: "greaterThan",
                    }
                ]
            },
        ]
        vi.spyOn(prisma.featureFlag, "findMany").mockResolvedValueOnce(flags as any)
        const filteredFlags = await getFlags(user)
        expect(filteredFlags).toHaveLength(flags.length)
    })
})

describe("non matching flags", () => {
    test("startsWith operation", async () => {
        const user: user = {
            username: "luffy",
            occupation: "citizen",
            powerLevel: 500
        }
        const flag: flag = {
            isEnabled: true,
            rules: [
                {
                    attribute: "username",
                    value: "asd",
                    operator: "startsWith",
                },
            ]
        }
        vi.spyOn(prisma.featureFlag, "findMany").mockResolvedValueOnce([flag] as any)
        const filteredFlags = await getFlags(user)
        expect(filteredFlags).toHaveLength(0)
    })

    test("endsWith operation", async () => {
        const user: user = {
            username: "bluffy",
            occupation: "citizen",
            powerLevel: 500
        }
        const flag: flag = {
            isEnabled: true,
            rules: [
                {
                    attribute: "username",
                    value: "asd",
                    operator: "endsWith",
                },
            ]
        }
        vi.spyOn(prisma.featureFlag, "findMany").mockResolvedValueOnce([flag] as any)
        const filteredFlags = await getFlags(user)
        expect(filteredFlags).toHaveLength(0)
    })

    test("equal operation", async () => {
        const user: user = {
            username: "luffy",
            occupation: "citizen",
            powerLevel: 500
        }
        const flag: flag = {
            isEnabled: true,
            rules: [
                {
                    attribute: "username",
                    value: "zoro",
                    operator: "equal",
                },
            ]
        }
        vi.spyOn(prisma.featureFlag, "findMany").mockResolvedValueOnce([flag] as any)
        const filteredFlags = await getFlags(user)
        expect(filteredFlags).toHaveLength(0)
    })

    test("greaterThan operation", async () => {
        const user: user = {
            username: "kakarot",
            occupation: "citizen",
            powerLevel: 9000
        }
        const flag: flag = {
            isEnabled: true,
            rules: [
                {
                    attribute: "powerLevel",
                    value: "9000",
                    operator: "greaterThan",
                },
            ]
        }
        vi.spyOn(prisma.featureFlag, "findMany").mockResolvedValueOnce([flag] as any)
        const filteredFlags = await getFlags(user)
        expect(filteredFlags).toHaveLength(0)
    })

    test("lessThan operation", async () => {
        const user: user = {
            username: "weak dude",
            occupation: "citizen",
            powerLevel: 5
        }
        const flag: flag = {
            isEnabled: true,
            rules: [
                {
                    attribute: "powerLevel",
                    value: "5",
                    operator: "lessThan",
                },
            ]
        }
        vi.spyOn(prisma.featureFlag, "findMany").mockResolvedValueOnce([flag] as any)
        const filteredFlags = await getFlags(user)
        expect(filteredFlags).toHaveLength(0)
    })

    test("multiple rules", async () => {
        const user: user = {
            username: "kakarot",
            occupation: "citizen",
            powerLevel: 9000
        }
        const flag: flag = {
            isEnabled: true,
            rules: [
                {
                    attribute: "occupation",
                    value: "pirate",
                    operator: "equal",
                },
                {
                    attribute: "powerLevel",
                    value: "8999",
                    operator: "greaterThan",
                },
            ]
        }
        vi.spyOn(prisma.featureFlag, "findMany").mockResolvedValueOnce([flag] as any)
        const filteredFlags = await getFlags(user)
        expect(filteredFlags).toHaveLength(0)
    })

    test("notEqual operation", async () => {
        const user: user = {
            username: "no match",
            occupation: "pirate",
            powerLevel: 500
        }
        const flag: flag = {
            isEnabled: true,
            rules: [
                {
                    attribute: "occupation",
                    value: "pirate",
                    operator: "notEqual",
                }
            ]
        }
        vi.spyOn(prisma.featureFlag, "findMany").mockResolvedValueOnce([flag] as any)
        const filteredFlags = await getFlags(user)
        expect(filteredFlags).toHaveLength(0)
    })
})