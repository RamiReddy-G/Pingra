import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (
  to: string,
  otp: string,
  purpose: string
) => {

  const subjectMap = {
    register: "Verify your account",
    login: "Login OTP",
    reset: "Password Reset OTP",
  };

  await transporter.sendMail({
    from: `"Pingra App" <${process.env.EMAIL_USER}>`,
    to,
    subject: subjectMap[purpose as keyof typeof subjectMap],
    html: `
    <div style="font-family: Arial; padding: 20px">
    <h2>🔐 OTP Verification</h2>
    <p>Your One-Time Password is:</p>
    <h1 style="letter-spacing: 5px;">${otp}</h1>
    <p>This OTP is valid for <b>5 minutes</b>.</p>
    <br/>
    <p>If you didn’t request this, please ignore.</p>
    </div>
    `,
  });
};