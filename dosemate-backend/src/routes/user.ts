import express, { Response } from "express";
import streamifier from "streamifier";
import User from "../models/user";
import cloudinary from "../config/cloudinary";
import upload from "../middleware/upload";
import { resolveUser, AuthRequest } from "../middleware/auth";

const router = express.Router();

router.use(resolveUser);

// GET /api/users/me — fetch current user's profile
router.get("/me", async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("-googleId");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/users/me — update profile fields
router.put("/me", async (req: AuthRequest, res: Response) => {
  try {
    // Prevent overwriting sensitive fields
    const { googleId, email, _id, ...safeFields } = req.body;

    const user = await User.findByIdAndUpdate(req.userId, safeFields, {
      new: true,
      runValidators: true,
    }).select("-googleId");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/users/me/settings — update notification settings
router.patch("/me/settings", async (req: AuthRequest, res: Response) => {
  try {
    const { highPriorityAlarms, dailyReminders } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        "settings.highPriorityAlarms": highPriorityAlarms,
        "settings.dailyReminders": dailyReminders,
      },
      { new: true }
    ).select("settings");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/users/me/avatar — upload profile image to Cloudinary
router.post(
  "/me/avatar",
  upload.single("avatar"),
  async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({ message: "No file provided" });
      return;
    }

    try {
      // Stream buffer to Cloudinary instead of writing to disk
      const uploadResult = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "dosemate/avatars",
              public_id: `user_${req.userId}`,
              overwrite: true,
              transformation: [{ width: 300, height: 300, crop: "fill" }],
            },
            (error, result) => {
              if (error || !result) return reject(error);
              resolve(result as { secure_url: string });
            }
          );
          streamifier.createReadStream(req.file!.buffer).pipe(stream);
        }
      );

      const user = await User.findByIdAndUpdate(
        req.userId,
        { profileImage: uploadResult.secure_url },
        { new: true }
      ).select("profileImage");

      res.json({ profileImage: user?.profileImage });
    } catch (err: any) {
      res.status(500).json({ message: "Upload failed", error: err.message });
    }
  }
);

export default router;
