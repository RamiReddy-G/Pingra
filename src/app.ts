import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";
import roomRoutes from "./routes/room.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());

/* RATE LIMIT */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/rooms", roomRoutes);

export default app;