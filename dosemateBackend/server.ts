import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";

dotenv.config();
connectDB();

const app: Application = express();

app.use(cors());
app.use(express.json());

// Routes
import medRoutes from "./routes/medication";
app.use("/api/medications", medRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
