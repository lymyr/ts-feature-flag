import { Router } from "express";
import { login, register } from "../controllers/userController.ts";
import { AccountValidation } from "../middleware/validation.ts";

const userRouter = Router()

userRouter.post("/", 
    AccountValidation.register,
    register
)

userRouter.post("/session",
    AccountValidation.login,
    login
)

export default userRouter