import { Router } from "express";
import { createFlag, deleteFlag, getFlag, getFlags, updateFlag } from "../controllers/flagController.ts";
import { FlagValidation, RuleValidation } from "../middleware/validation.ts";
import isAuth from "../middleware/isAuth.ts";
import isAdmin from "../middleware/isAdmin.ts";
import { createUpdateRules } from "../controllers/ruleController.ts";

const flagRouter = Router()

flagRouter.use(isAuth, isAdmin)

flagRouter.post("/",
    FlagValidation.validateFlag,
    createFlag
)
flagRouter.get("/",
    getFlags
)
flagRouter.put("/:flagId",
    FlagValidation.validateFlag,
    FlagValidation.validateFlagId,
    updateFlag
)
flagRouter.delete("/:flagId",
    FlagValidation.validateFlagId,
    deleteFlag
)
flagRouter.get("/:flagId",
    FlagValidation.validateFlagId,
    getFlag
)

flagRouter.put("/:flagId/rules",
    FlagValidation.validateFlagId,
    RuleValidation.validateRule,
    createUpdateRules
)

export default flagRouter