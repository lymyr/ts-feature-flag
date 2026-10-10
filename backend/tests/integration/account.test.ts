import request, { type Response } from "supertest"
import { expect, test, describe, afterAll, vi, afterEach } from "vitest"
import app from "../../src/app.ts"
import { prisma } from "../../lib/prisma.ts"
import jwt from "jsonwebtoken"

const prismaUserMock = vi.spyOn(prisma.user, "create")

afterEach(() => {
    prismaUserMock.mockClear()
})

afterAll(async () => {
    await prisma.user.deleteMany()
})

describe("Register", () => {
    test("creates an account", async () => {
        const res: Response = await request(app)
            .post("/users")
            .send({
                username: "luffy",
                password: "abcd123",
                confirmPassword: "abcd123",
                occupation: "pirate",
                powerLevel: "0"
            })

        expect(prismaUserMock).toHaveBeenCalledTimes(1)
        expect(res.status).toBe(201)
    })

    test("username already exists", async () => {
        const res: Response = await request(app)
            .post("/users")
            .send({
                username: "luffy",
                password: "abcd123",
                confirmPassword: "abcd123",
                occupation: "pirate",
                powerLevel: "0"
            })
            
        expect(prismaUserMock).toHaveBeenCalledTimes(0)
        expect(res.status).toBe(400)
    })

    test("invalid username", async () => {
        const res: Response = await request(app)
            .post("/users")
            .send({
                username: "",
                password: "abcd123",
                confirmPassword: "abcd123",
                occupation: "pirate",
                powerLevel: "0"
            })

        expect(prismaUserMock).toHaveBeenCalledTimes(0)
        expect(res.status).toBe(400)
    })

    test("invalid password", async () => {
        const res: Response = await request(app)
            .post("/users")
            .send({
                username: "luffy",
                password: "",
                confirmPassword: "",
                occupation: "pirate",
                powerLevel: "0"
            })

        expect(prismaUserMock).toHaveBeenCalledTimes(0)
        expect(res.status).toBe(400)
    })

    test("password and confirm password doesn't match", async () => {
        const res: Response = await request(app)
            .post("/users")
            .send({
                username: "luffy",
                password: "abc123",
                confirmPassword: "123abc",
                occupation: "pirate",
                powerLevel: "0"
            })
        
        expect(prismaUserMock).toHaveBeenCalledTimes(0)
        expect(res.status).toBe(400)
    })

    test("invalid occupation", async () => {
        const res: Response = await request(app)
            .post("/users")
            .send({
                username: "luffy",
                password: "abcd123",
                occupation: "something else",
                powerLevel: "0"
            })
        
        expect(prismaUserMock).toHaveBeenCalledTimes(0)
        expect(res.status).toBe(400)
    })

    test("invalid powerLevel", async () => {
        const res: Response = await request(app)
            .post("/users")
            .send({
                username: "luffy",
                password: "abcd123",
                occupation: "pirate",
                powerLevel: "-1"
            })
            
        expect(prismaUserMock).toHaveBeenCalledTimes(0)
        expect(res.status).toBe(400)
    })

    test("reject admin occupation via register", async () => {
        const res: Response = await request(app)
            .post("/users")
            .send({
                username: "maliciousAdmin",
                password: "abcd123",
                confirmPassword: "abcd123",
                occupation: "admin",
                powerLevel: "432"
            })
            
        expect(prismaUserMock).toHaveBeenCalledTimes(0)
        expect(res.status).toBe(400)
    })
})


describe("login", () => {
    const jwtMock = vi.spyOn(jwt, "sign")

    afterEach(() => {
        jwtMock.mockClear()
    })

    test("correct credentials", async () => {
        jwtMock.mockImplementationOnce(() => {
            return "token"
        })
        const res: Response = await request(app)
            .post("/users/session")
            .send({
                username: "luffy",
                password: "abcd123"
            })
        
        expect(jwtMock).toHaveBeenCalledOnce()
        expect(res.body.data.token).toBe("token")
        expect(res.status).toBe(200)
    })

    test("incorrect credentials", async () => {
        jwtMock.mockImplementationOnce(() => {
            return "token"
        })
        const res: Response = await request(app)
            .post("/users/session")
            .send({
                username: "luffy",
                password: "abc123"
            })

        expect(jwtMock).toHaveBeenCalledTimes(0)
        expect(res.body.data).toBeUndefined()
        expect(res.status).toBe(401)
    })
})