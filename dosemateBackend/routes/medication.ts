import express, { Request, Response } from "express";
const router = express.Router();
import Medication from "../models/medication";

// Get all meds for a user
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const meds = await Medication.find({ userId: req.params.userId });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Add new med (The screen at 00:24 in your video)
router.post("/", async (req: Request, res: Response) => {
  try {
    const newMed = new Medication(req.body);
    const savedMed = await newMed.save();
    res.status(201).json(savedMed);
  }  catch (err: any) { 
  res.status(400).json({ message: err.message });
}
});

export default router;
