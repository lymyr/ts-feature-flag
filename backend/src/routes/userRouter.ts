import { Router } from "express";
import { register } from "../controllers/userController.ts";
import { AccountValidation } from "../middleware/validation.ts";

const userRouter = Router()

userRouter.post("/", 
    AccountValidation.register,
    register
)

export default userRouter