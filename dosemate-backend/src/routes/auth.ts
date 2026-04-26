import express, { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/user";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// GUEST MODE
// POST /api/auth/guest — call this on first app launch to get a guestId.
// The app stores this in AsyncStorage and sends it as `x-guest-id` on
// every subsequent request.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/guest", async (_req: Request, res: Response) => {
  try {
    const guestId = new mongoose.Types.ObjectId().toString();

    const user = await User.create({
      _id: guestId,
      fullName: "Guest User",
      email: `guest_${guestId}@dosemate.local`,
    });

    res.status(201).json({
      guestId: user._id,
      message: "Guest session created. Store this ID as x-guest-id.",
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE OAUTH — DISABLED UNTIL PASSPORT IS ENABLED
//
// To re-enable:
//  1. Follow the steps in src/config/passport.ts
//  2. Uncomment the block below
// ─────────────────────────────────────────────────────────────────────────────

/*
import passport from "passport";

// Redirect to Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (_req: Request, res: Response) => {
    // On success, redirect to the app deep link or send a token
    res.redirect("dosemate://auth/success");
  }
);

// Logout
router.post("/logout", (req: Request, res: Response) => {
  req.logout(() => {
    res.json({ message: "Logged out" });
  });
});
*/

export default router;
