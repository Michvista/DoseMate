// src/routes/doseLog.ts  — ADD dateFrom/dateTo support for CalendarCard
import express, { Response } from "express";
import DoseLog from "../models/doseLog";
import { resolveUser, AuthRequest } from "../middleware/auth";

const router = express.Router();
router.use(resolveUser);

// GET /api/dose-logs
// Query params:
//   date        — single day  (YYYY-MM-DD)
//   dateFrom    — range start (YYYY-MM-DD)
//   dateTo      — range end   (YYYY-MM-DD)
//   medicationId, status
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const filter: Record<string, any> = { userId: req.userId };

    if (req.query.medicationId) filter.medicationId = req.query.medicationId;
    if (req.query.status) filter.status = req.query.status;

    // Single-day filter
    if (req.query.date) {
      const day = new Date(req.query.date as string);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      filter.scheduledTime = { $gte: day, $lt: next };
    }

    // Date-range filter (used by CalendarCard)
    if (req.query.dateFrom || req.query.dateTo) {
      filter.scheduledTime = {};
      if (req.query.dateFrom)
        filter.scheduledTime.$gte = new Date(req.query.dateFrom as string);
      if (req.query.dateTo) {
        const end = new Date(req.query.dateTo as string);
        end.setDate(end.getDate() + 1); // inclusive end
        filter.scheduledTime.$lt = end;
      }
    }

    const logs = await DoseLog.find(filter)
      .populate("medicationId", "name type dosage scheduleType")
      .sort({ scheduledTime: 1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/dose-logs/stats — weekly adherence + streak
router.get("/stats", async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    const weekLogs = await DoseLog.find({
      userId: req.userId,
      scheduledTime: { $gte: weekAgo, $lte: now },
      status: { $in: ["TAKEN", "MISSED", "SKIPPED"] },
    });

    const total = weekLogs.length;
    const taken = weekLogs.filter((l) => l.status === "TAKEN").length;
    const weeklyAccuracy = total > 0 ? Math.round((taken / total) * 100) : 0;

    // Per-day accuracy for the last 7 days (for bar chart)
    const dailyStats: { day: string; accuracy: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      const dayLogs = weekLogs.filter(
        (l) =>
          new Date(l.scheduledTime) >= day && new Date(l.scheduledTime) < next,
      );
      const dayTaken = dayLogs.filter((l) => l.status === "TAKEN").length;
      const dayTotal = dayLogs.length;
      dailyStats.push({
        day: format(day),
        accuracy: dayTotal > 0 ? Math.round((dayTaken / dayTotal) * 100) : 0,
      });
    }

    const streak = await calculateStreak(req.userId!);

    res.json({ weeklyAccuracy, streak, total, taken, dailyStats });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

function format(d: Date): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
}

async function calculateStreak(userId: string): Promise<number> {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);

    const taken = await DoseLog.exists({
      userId,
      scheduledTime: { $gte: day, $lt: next },
      status: "TAKEN",
    });

    if (taken) streak++;
    else break;
  }
  return streak;
}

// POST — create a dose log
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const log = new DoseLog({ ...req.body, userId: req.userId });
    const saved = await log.save();
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /:id — mark TAKEN / MISSED / SKIPPED
router.patch("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body as {
      status: "TAKEN" | "MISSED" | "SKIPPED" | "UPCOMING";
    };
    const log = await DoseLog.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      // { status, ...(status === "TAKEN" ? { takenAt: new Date() } : {}) },
        {
      status,
      ...(status === "TAKEN"    ? { takenAt: new Date() } : {}),
      ...(status === "UPCOMING" ? { $unset: { takenAt: 1 } } : {}), 
    },
      { new: true },
    ).populate("medicationId", "name type dosage scheduleType");

    if (!log) {
      res.status(404).json({ message: "Log not found" });
      return;
    }
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
