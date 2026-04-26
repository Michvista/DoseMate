import express, { Request, Response } from "express";
const router = express.Router();
import User from "../models/user";

// Update Profile (The screen at 01:29 in your video)
router.put("/profile/:id", async (req: Request, res: Response) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

export default router;
