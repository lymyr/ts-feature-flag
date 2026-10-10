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
    test.todo("add rule to a flag", () => {

    })

    test.todo("remove rule from a flag", () => {
        
    })

    test.todo("unauthorized user", () => {
        
    })

    test.todo("invalid rule", () => {
        
    })
})