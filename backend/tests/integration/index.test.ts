import request, {type Response} from "supertest"
import {expect, test } from "vitest"
import app from "../../src/app.ts"

test("works", async () => {
    const res: Response = await request(app)
        .get("/")
        
    expect(res.body).toEqual({msg: "hello"})
})