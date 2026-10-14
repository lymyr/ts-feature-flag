import express from "express";
import userRouter from "./routes/userRouter.ts";
import flagRouter from "./routes/flagRouter.ts";
import clientRouter from "./routes/clientRouter.ts";
import cors, { type CorsOptions } from "cors"
process.loadEnvFile()

const app = express()

const corsOptions: CorsOptions = process.env.NODE_ENV ? 
    {} : {
        origin: process.env.ORIGINS?.split(",")
    }

app.use(cors(corsOptions))
app.use(express.json())

app.use("/flags", flagRouter)
app.use("/users", userRouter)
app.use("/client", clientRouter)

if (process.env.NODE_ENV != "test") {
    app.listen(process.env.PORT, () => {
        console.log("Listening to " + process.env.PORT)
    })
}

export default app