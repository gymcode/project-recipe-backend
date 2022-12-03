import express from "express"
const router = express.Router()
import client from "../config/redis"

// schemas 
import { RegistrationSchema } from "../utils/joiValidation"

// middlewares 
import { userValidationMiddleware, isUserAuthenticated } from "../middleware/userMiddleware"

import {userRegistration, userLogin, getUser, confirmOTP, resendOTP, resetPassword, logOut} from "../controller/userController"

// route to register a new user 
router.post('/register', userValidationMiddleware(RegistrationSchema), userRegistration())

router.put("/confirm-otp", confirmOTP())

router.get("/resend", resendOTP())

router.put("/reset", resetPassword())

router.post('/login', userLogin())

router.get("/user", isUserAuthenticated(client), getUser())

router.delete("/logout",isUserAuthenticated(client), logOut())



export default router

