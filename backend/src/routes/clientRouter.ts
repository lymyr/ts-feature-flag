import { Router } from "express";
import isAuth from "../middleware/isAuth.ts";

import filterFlag from "../middleware/filterFlag.ts";
import { getFlags } from "../controllers/clientController.ts";

const clientRouter = Router()

clientRouter.use(isAuth)

clientRouter.get("/", 
    filterFlag,
    getFlags
)

export default clientRouter