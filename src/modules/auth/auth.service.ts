import User from "./auth.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ---------------- CREATE USER ---------------- */

export const createUserAfterOtp = async (
  name: string,
  email: string,
  password: string
) => {

  const existing = await User.findOne({ email });

  if (existing) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    isVerified: true,
  });

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return { user, token };
};

/* ---------------- LOGIN PASSWORD ---------------- */

export const loginUser = async (email: string, password: string) => {

  const user = await User.findOne({ email }).select("+password");

  if (!user) throw new Error("Invalid credentials");

  if (!user.isVerified) throw new Error("Email not verified");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return { user, token };
};

/* ---------------- LOGIN WITH OTP ---------------- */

export const loginWithOtp = async (email: string) => {

  const user = await User.findOne({ email });

  if (!user) throw new Error("User not found");

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return { user, token };
};

/* ---------------- RESET PASSWORD ---------------- */

export const resetPassword = async (
  email: string,
  newPassword: string
) => {

  const user = await User.findOne({ email });

  if (!user) throw new Error("User not found");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;

  await user.save();

  return { message: "Password reset successful" };
};

/* ---------------- USERS ---------------- */

export const getAllUsersExceptMe = async (myId: string) => {
  return User.find({ _id: { $ne: myId } }).select("_id name email");
};