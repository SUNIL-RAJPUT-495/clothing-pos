import { Router } from "express";
import { Login, updatePassword } from "../controller/user.Controller.js";
import { protect } from "../middleware/authMiddleware.js";

const userRouter = Router()

userRouter.post('/login', Login)
userRouter.put('/update-password', protect, updatePassword)

export default userRouter