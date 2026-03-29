import { Request, Response } from "express";

import {
  createUserAfterOtp,
  loginUser,
  loginWithOtp,
  resetPassword,
  getAllUsersExceptMe,
} from "./auth.service";

import {
  createOtp,
  verifyOtp as verifyOtpService,
} from "../otp/otp.service";

import { sendOtpEmail } from "../../config/mail";
import User from "./auth.model";

/* ---------------- SEND OTP ---------------- */

export const sendOtpController = async (req: Request, res: Response) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({ message: "Email and purpose required" });
    }

    const user = await User.findOne({ email });

    /* ---------------- LOGIN ---------------- */

    if (purpose === "login") {
      if (!user) {
        return res.status(400).json({ message: "User does not exist" });
      }
    }

    /* ---------------- RESET ---------------- */

    if (purpose === "reset") {
      if (!user) {
        return res.status(400).json({ message: "User does not exist" });
      }
    }

    /* ---------------- REGISTER ---------------- */

    if (purpose === "register") {
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }
    }

    /* ---------------- CREATE OTP ---------------- */

    const result = await createOtp(email, purpose);

    await sendOtpEmail(email, result.otp, purpose);

    res.json({ message: "OTP sent successfully" });

  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/* ---------------- VERIFY OTP ---------------- */

export const verifyOtpController = async (req: Request, res: Response) => {
  try {
    const { email, otp, purpose, name, password } = req.body;

    await verifyOtpService(email, otp, purpose);

    /* LOGIN */

    if (purpose === "login") {
      const result = await loginWithOtp(email);
      return res.json(result);
    }

    /* REGISTER */

    if (purpose === "register") {
      const result = await createUserAfterOtp(name, email, password);
      return res.status(201).json(result);
    }

    /* RESET */

    if (purpose === "reset") {
      return res.json({ message: "OTP verified" });
    }

  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/* ---------------- LOGIN PASSWORD ---------------- */

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    res.json(result);

  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};

/* ---------------- RESET PASSWORD ---------------- */

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    const result = await resetPassword(email, newPassword);

    res.json(result);

  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/* ---------------- USERS ---------------- */

export const getUsers = async (req: any, res: any) => {
  try {
    const users = await getAllUsersExceptMe(req.userId);
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};