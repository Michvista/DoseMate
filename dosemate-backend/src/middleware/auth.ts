import { Request, Response, NextFunction } from "express";
import User from "../models/user";

// ─────────────────────────────────────────────────────────────────────────────
// GUEST MIDDLEWARE
//
// In guest mode the mobile app sends an `x-guest-id` header with a userId.
// If the user doesn't exist yet (first launch), we auto-create a guest account.
//
// When you switch to Passport auth, replace this middleware with a proper
// JWT/session guard and remove the x-guest-id header usage from the app.
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthRequest extends Request {
  userId?: string;
}

export const resolveUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // --- Future auth swap point ---
  // If using Passport sessions, check req.user here instead:
  // if (req.isAuthenticated && req.isAuthenticated()) {
  //   req.userId = (req.user as any)._id.toString();
  //   return next();
  // }

  const guestId = req.headers["x-guest-id"] as string | undefined;

  if (!guestId) {
    res.status(401).json({ message: "Missing x-guest-id header" });
    return;
  }

  try {
    let user = await User.findById(guestId);

    // Auto-create a minimal guest user on first launch
    if (!user) {
      user = await User.create({
        _id: guestId,
        fullName: "Guest User",
        email: `guest_${guestId}@dosemate.local`,
      });
    }

    req.userId = user._id.toString();
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid guest ID" });
  }
};
