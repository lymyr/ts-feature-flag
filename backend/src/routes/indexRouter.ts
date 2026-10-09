import { Router } from "express";
import { basic } from "../controllers/indexController.js";

const indexRouter = Router()

indexRouter.use("/", basic)

export default indexRouter