import { Router } from "express";
import {
  sendOtpController,
  verifyOtpController,
  login,
  resetPasswordController,
  getUsers,
} from "../modules/auth/auth.controller";

import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

/* OTP SYSTEM */
router.post("/send-otp", sendOtpController);
router.post("/verify-otp", verifyOtpController);

/* LOGIN */
router.post("/login", login);

/* RESET PASSWORD */
router.post("/reset-password", resetPasswordController);

/* USERS */
router.get("/users", authMiddleware, getUsers);

export default router;