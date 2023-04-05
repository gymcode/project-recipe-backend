import express from "express";
const router = express.Router();

// schemas
import { RegistrationSchema } from "../utils/joiValidation";

// middlewares
import {
  userValidationMiddleware,
  isUserAuthenticated,
} from "../middleware/userMiddleware";

import {
  userRegistration,
  userLogin,
  getUser,
  confirmOTP,
  resendOTP,
  resetPassword,
  logOut,
  generateRefreshToken
} from "../controller/userController";

// route to register a new user
router.post(
  "/register",
  userValidationMiddleware(RegistrationSchema),
  userRegistration()
);

router.put("/confirm-otp", confirmOTP());

router.put("/resend", resendOTP());

router.put("/reset", resetPassword());

router.post("/login", userLogin());

router.post("/refresh-token", generateRefreshToken());

router.get("/", isUserAuthenticated(), getUser());

router.delete("/logout", isUserAuthenticated(), logOut());

export default router;
