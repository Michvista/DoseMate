import express, { Response } from "express";
import Medication from "../models/medication";
import { resolveUser, AuthRequest } from "../middleware/auth";
import Doselog from "../models/doseLog";

const router = express.Router();

// All medication routes require a resolved user (guest or authed)
router.use(resolveUser);

// GET /api/medications — all meds for the current user
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const meds = await Medication.find({ userId: req.userId });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/medications/:id — single med
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const med = await Medication.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!med) {
      res.status(404).json({ message: "Medication not found" });
      return;
    }
    res.json(med);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/medications — add new med
// POST /api/medications — add new med AND create first logs
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const newMed = new Medication({ ...req.body, userId: req.userId });
    const savedMed = await newMed.save();

    const firstLog = new Doselog({
      userId: req.userId,
      medicationId: savedMed._id,
      scheduledTime: new Date(), // Set to right now for testing
      status: "UPCOMING"
    });
    await firstLog.save();

    res.status(201).json(savedMed);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});
// PUT /api/medications/:id — edit med
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const med = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!med) {
      res.status(404).json({ message: "Medication not found" });
      return;
    }
    res.json(med);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/medications/:id
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const med = await Medication.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!med) {
      res.status(404).json({ message: "Medication not found" });
      return;
    }
    res.json({ message: "Medication deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/medications/:id/status — toggle Active/Inactive
router.patch("/:id/status", async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body as { status: "Active" | "Inactive" };
    const med = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { status },
      { new: true }
    );
    if (!med) {
      res.status(404).json({ message: "Medication not found" });
      return;
    }
    res.json(med);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
