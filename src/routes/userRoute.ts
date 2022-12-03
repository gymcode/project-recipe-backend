import express from "express"
const router = express.Router()
import client from "../config/redis"

// schemas 
import { RegistrationSchema } from "../utils/joiValidation"

// middlewares 
import { userValidationMiddleware, isUserAuthenticated } from "../middleware/userMiddleware"

import userController from "../controller/userController"

// route to register a new user 
router.post('/register', userValidationMiddleware(RegistrationSchema), userController.userRegistration)

router.put("/confirm-otp", userController.confirmOTP)

router.get("/resend", userController.resendOTP)

router.put("/reset", userController.resetPin)

router.post('/login', userController.userLogin)

router.get("/user", isUserAuthenticated(client), userController.getUser)

router.delete("/logout",isUserAuthenticated(client), userController.logOut)

router.delete("/delete", isUserAuthenticated(client), userController.delete)


export default router

