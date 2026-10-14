import app from "../../src/app.ts"
import request, { Response } from "supertest"
import {beforeAll, afterEach, Mock, test, vi, expect, afterAll} from "vitest"
import jwt from "jsonwebtoken"
import { prisma } from "../../lib/prisma.ts";

let jwtMock: Mock;
let flags: Awaited<ReturnType<typeof prisma.featureFlag.createManyAndReturn>>
beforeAll(async () => {
    jwtMock = vi.spyOn(jwt, "verify")
        .mockImplementationOnce(() => {throw new Error("")})
        .mockImplementationOnce(() => {
            return {
                username: "admin",
                powerLevel: 0,
                occupation: "admin"
            }
        })
        .mockImplementation(() => {
            return {
                username: "luffy",
                powerLevel: 9000,
                occupation: "pirate"
            }
        })

    flags = await prisma.featureFlag.createManyAndReturn({
        data: [
            {
                name: "strong fighter",
                isEnabled: true,
            },
            {
                name: "Marine Base",
                isEnabled: true,
            },
            {
                name: "going merry",
                isEnabled: true
            }
        ]
    })

    await prisma.rule.createManyAndReturn({
        data: [
            {
                flagId: flags[0].id,
                value: "8999",
                operator: "greaterThan",
                attribute:"powerLevel"
            },
            {
                flagId: flags[1].id,
                value: "marine",
                operator: "equal",
                attribute: "occupation"
            },
            {
                flagId: flags[2].id,
                value: "luffy",
                operator: "equal",
                attribute: "username"
            }
        ]
    })
})

afterAll(async () => {
    await prisma.rule.deleteMany()
    await prisma.featureFlag.deleteMany()
})

afterEach(async () => {
    jwtMock.mockClear()
})

test("unauthorized user", async () => {
    const res: Response = await request(app)
        .get("/client")
        .set("Authorization", "bearer token")

    expect(res.status).toBe(401)
})

test("retrieve all flags for admin", async () => {
    const res: Response = await request(app)
        .get("/client")
        .set("Authorization", "bearer token")

    expect(res.body.data.flags.length).toBe(flags.length)
    expect(res.body.data.flags).toEqual(expect.arrayContaining(flags))
})

test("retrieve only valid flags for non-admin occupation", async () => {
    const res: Response = await request(app)
        .get("/client")
        .set("Authorization", "bearer token")
    
    const flagIds = flags
        .filter((f: typeof flags[0]) => {
            if (f.name == "Marine Base")
                return false
            return true
        })
        .map((f: typeof flags[0]) => { return {id: f.id} })

    const resFlagIds = res.body.data.flags
        .map((f: typeof flags[0]) => {
            return {id: f.id}
        })

    expect(resFlagIds).toEqual(expect.arrayContaining(flagIds))
    expect(resFlagIds).toHaveLength(flagIds.length)
})