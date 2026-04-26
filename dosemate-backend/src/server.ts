import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";

dotenv.config();
connectDB();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
import medRoutes from "./routes/medication";
import doseLogRoutes from "./routes/doseLog";
import userRoutes from "./routes/user";

// NOTE: Auth routes are wired but passport is disabled for now (guest mode).
// When you're ready to enable Google OAuth, uncomment the passport block in
// src/config/passport.ts and swap the commented lines below.
import authRoutes from "./routes/auth";

app.use("/api/medications", medRoutes);
app.use("/api/dose-logs", doseLogRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "DoseMate API is running 🚀" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
