import express from "express";
import indexRouter from "./routes/indexRouter.js";
import userRouter from "./routes/userRouter.ts";
process.loadEnvFile()

const app = express()

app.use(express.json())

app.use("/user", userRouter)
app.use("/", indexRouter)

if (process.env.NODE_ENV != "test") {
    app.listen(process.env.PORT, () => {
        console.log("Listening to " + process.env.PORT)
    })
}

export default app