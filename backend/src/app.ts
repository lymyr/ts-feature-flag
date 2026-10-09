import express from "express";
import indexRouter from "./routes/indexRouter.js";
process.loadEnvFile()

const app = express()

app.use(indexRouter)

if (process.env.NODE_ENV != "test") {
    app.listen(process.env.PORT, () => {
        console.log("Listening to " + process.env.PORT)
    })
}

export default app