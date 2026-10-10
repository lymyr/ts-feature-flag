import { Router } from "express";
import { createFlag, deleteFlag, getFlag, getFlags, updateFlag } from "../controllers/flagController.ts";
import { FlagValidation } from "../middleware/validation.ts";
import isAuth from "../middleware/isAuth.ts";
import isAdmin from "../middleware/isAdmin.ts";

const flagRouter = Router()

flagRouter.use(isAuth, isAdmin)

flagRouter.post("/",
    createFlag
)

flagRouter.get("/",
    getFlags
)

flagRouter.put("/:flagId",
    FlagValidation.id,
    updateFlag
)

flagRouter.delete("/:flagId",
    FlagValidation.id,
    deleteFlag
)


flagRouter.get("/:flagId",
    FlagValidation.id,
    getFlag
)

export default flagRouter