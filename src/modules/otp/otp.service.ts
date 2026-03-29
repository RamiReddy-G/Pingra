import Otp from "./otp.model";
import crypto from "crypto";

export const createOtp = async (
  email: string,
  purpose: "register" | "login" | "reset"
) => {

  const existing = await Otp.findOne({ email, purpose });

  if (existing) {

    const timeDiff =
      Date.now() - new Date(existing.createdAt).getTime();

    // ⏳ 60 sec cooldown
    if (timeDiff < 60 * 1000) {
      const remaining = Math.ceil((60 * 1000 - timeDiff) / 1000);

      throw new Error(
        `Please wait ${remaining}s before requesting another OTP`
      );
    }

    // 🧹 Delete old OTP before creating new
    await Otp.deleteOne({ _id: existing._id });
  }

  const otp = crypto.randomInt(100000, 999999).toString();

  await Otp.create({
    email,
    otp,
    purpose,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min expiry
  });

  return {
    otp,
    cooldown:60
};
};

export const verifyOtp = async (
  email: string,
  otp: string,
  purpose: string
) => {

  const record = await Otp.findOne({ email, otp, purpose });

  if (!record) throw new Error("Invalid OTP");

  if (record.expiresAt < new Date()) {
    await Otp.deleteOne({ _id: record._id });
    throw new Error("OTP expired");
  }

  await Otp.deleteOne({ _id: record._id });

  return true;
};