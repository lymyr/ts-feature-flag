import request, { type Response } from "supertest";
import app from "../../src/app.ts";
import { prisma } from "../../lib/prisma.ts";
import { afterAll, beforeAll, describe, expect, vi, test } from "vitest";
import jwt from "jsonwebtoken";

afterAll(async () => {
    await prisma.rule.deleteMany()
    await prisma.featureFlag.deleteMany()
})

let admin: Awaited<ReturnType<typeof prisma.user.create>>;
let createdFlagId: number;

beforeAll(async () => {
    admin = await prisma.user.create({data: {
        username: "admin",
        password: "123",
        occupation: "admin"
    }})
})

afterAll(async () => {
    await prisma.user.deleteMany()
    await prisma.rule.deleteMany()
    await prisma.featureFlag.deleteMany()
})


describe("flag model", () => {
    beforeAll(() => {       
        vi.spyOn(jwt, "verify").mockImplementation(() => admin)
    })

    test("adding flag", async () => {
        const res: Response = await request(app)
            .post("/flags")
            .set("authorization", "bearer token")
            .send({
                name: "flagName",
                isEnabled: true,
                attribute: "username"
            })

        createdFlagId = res.body.data.flag.id
        expect(res.status).toBe(201)
        expect(res.body.data.flag).toBeDefined()
    })

    test("update flag", async () => {
        const res: Response = await request(app)
            .put(`/flags/${createdFlagId}`)
            .set("authorization", "bearer token")
            .send({
                name: "flagName",
                isEnabled: false,
                attribute: "username"
            })

        expect(res.status).toBe(200)
        expect(res.body.data.flag.isEnabled).toBe(false)
    })

    test("update non-existing flag", async () => {
        const res: Response = await request(app)
            .put(`/flags/${createdFlagId == 1 ? 0 : 1}`)
            .set("authorization", "bearer token")
            .send({
                name: "flagName",
                isEnabled: false,
                attribute: "username"
            })

        expect(res.status).toBe(404)
    })

    test("retrieve flag list", async () => {
        const res: Response = await request(app)
            .get(`/flags`)
            .set("authorization", "bearer token")

        expect(res.body.data.flags).toEqual(expect.any(Array))
    })

    test("retrieve flag and its rules", async () => {
        const res: Response = await request(app)
            .get(`/flags/${createdFlagId}`)
            .set("authorization", "bearer token")

        expect(res.body.data.flag.rules).toEqual(expect.any(Array))
    })

    test("remove flag", async () => {
        await request(app)
            .delete(`/flags/${createdFlagId}`)
            .set("authorization", "bearer token")
        const flag = await prisma.featureFlag.findFirst({where: {id: createdFlagId}})
        expect(flag).toBeNullable()
    })

    test("unauthorized user", async () => {
        vi.spyOn(jwt, "verify").mockImplementation(() => {
            throw new Error("Unauthorized")
        })
        const res: Response = await request(app)
            .get(`/flags`)
            .set("authorization", "bearer token")

        expect(res.status).toBe(401)
    })

    test("non-admin user", async () => {
        vi.spyOn(jwt, "verify").mockImplementation(() => {
            return { occupation: "citizen" }
        })
        const res: Response = await request(app)
            .get(`/flags`)
            .set("authorization", "bearer token")

        expect(res.status).toBe(403)
    })
})

describe("rule model", () => {
    let flag: Awaited<ReturnType<typeof prisma.featureFlag.create>>;
    beforeAll(async () => {
        flag = await prisma.featureFlag.create({
            data: {
                name: "good pirate",
                isEnabled: true,
                attribute: "username"
            }
        })
        vi.spyOn(jwt, "verify").mockImplementation(() => admin)
    })

    test("put rule to flag", async () => {
        const res = await request(app)
            .put(`/flags/${flag.id}/rules`)
            .set("authorization", "bearer token")
            .send({rules: [
                    {
                        value: "luffy",
                        operator: "equal",
                    }
            ]})
        
        expect(res.body.data.rules).toEqual(expect.any(Array))
        expect(res.body.data.rules).toHaveLength(1)
    })

    test("put multiple rules to flag", async () => {
        const res = await request(app)
            .put(`/flags/${flag.id}/rules`)
            .set("authorization", "bearer token")
            .send({rules: [
                {
                    value: "zoro",
                    operator: "equal",
                },
                {
                    value: "sanji",
                    operator: "equal",
                },
            ]})

        expect(res.body.data.rules).toEqual(expect.any(Array))
        expect(res.body.data.rules).toHaveLength(2)
    })

    test("put number with number op", async () => {
        const res = await request(app)
            .put(`/flags/${flag.id}/rules`)
            .set("authorization", "bearer token")
            .send({rules: [
                {
                    value: "42",
                    operator: "greaterThan",
                }
            ]})

        expect(res.body.data.rules).toEqual(expect.any(Array))
        expect(res.body.data.rules).toHaveLength(1)
    })

    test("put string with string op", async () => {
        const res = await request(app)
            .put(`/flags/${flag.id}/rules`)
            .set("authorization", "bearer token")
            .send({rules: [
                {
                    value: "luffy",
                    operator: "startsWith",
                }
            ]})

        expect(res.body.data.rules).toEqual(expect.any(Array))
        expect(res.body.data.rules).toHaveLength(1)
    })

    test("put mixed with string op", async () => {
        const res = await request(app)
            .put(`/flags/${flag.id}/rules`)
            .set("authorization", "bearer token")
            .send({rules: [
                {
                    value: "83luffy43",
                    operator: "endsWith",
                }
            ]})

        expect(res.body.data.rules).toEqual(expect.any(Array))
        expect(res.body.data.rules).toHaveLength(1)
    })

    // kinda lazy to implement frontend if i limit rules to...
    // one by one update ~n~
    test.skip("update rule from flag", async () => {

    })

    test("remove rules from flag", async () => {
        const res = await request(app)
            .put(`/flags/${flag.id}/rules`)
            .set("authorization", "bearer token")
            .send({rules: []})
        
        const rules = await prisma.rule.findMany({ where: {flagId: flag.id}})
        expect(res.body.data.rules).toEqual(expect.any(Array))
        expect(res.body.data.rules).toHaveLength(0)
        expect(rules).toHaveLength(0)
    })

    describe("invalid rule", () => {
        test("unknown operator", async () => {
            const res = await request(app)
                .put(`/flags/${flag.id}/rules`)
                .set("authorization", "bearer token")
                .send({rules: [
                    {
                        value: "zoro",
                        operator: "badOperator",
                    }
                ]})
            expect(res.status).toBe(400)
        })

        test("duplicate rule", async () => {
            const res = await request(app)
                .put(`/flags/${flag.id}/rules`)
                .set("authorization", "bearer token")
                .send({rules: [
                    {
                        value: "zoro",
                        operator: "equal",
                    },
                    {
                        value: "zoro",
                        operator: "startsWith",
                    },
                    {
                        value: "zoro",
                        operator: "endsWith",
                    },
                    {
                        value: "zoro",
                        operator: "equal",
                    },
                ]})

            expect(res.status).toBe(400)
        })

        test("string value with number operator", async () => {
            const res = await request(app)
                .put(`/flags/${flag.id}/rules`)
                .set("authorization", "bearer token")
                .send({rules: [
                    {
                        value: "zoro",
                        operator: "lessThan",
                    }
                ]})
            
            expect(res.status).toBe(400)
        })

        test("number value with string operator", async () => {
            const res = await request(app)
                .put(`/flags/${flag.id}/rules`)
                .set("authorization", "bearer token")
                .send({rules: [
                    {
                        value: "4",
                        operator: "startsWith",
                    }
                ]})

            expect(res.status).toBe(400)
        })

        test("mixed value with number operator", async () => {
            const res = await request(app)
                .put(`/flags/${flag.id}/rules`)
                .set("authorization", "bearer token")
                .send({rules: [
                    {
                        value: "4asd",
                        operator: "lessThan",
                    }
                ]})

            expect(res.status).toBe(400)
        })
    })
    
})