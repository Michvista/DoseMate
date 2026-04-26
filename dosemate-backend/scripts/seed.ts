// // Run: npx ts-node scripts/seed.ts
// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import DoseLog from "../src/models/doseLog";
// import Medication from "../src/models/medication";
// import User from "../src/models/user";
// import path from "path";

// dotenv.config({ path: path.resolve(__dirname, '../.env') });

// const SEED_GUEST_ID = "000000000000000000000001";

// const MEDICATIONS = [
//   { name: "Paracetamol", type: "pill", dosage: { value: 500, unit: "mg" }, scheduleType: "Morning & Evening" as const, times: ["08:00", "20:00"], startDate: new Date("2023-10-01"), endDate: new Date("2023-12-31"), notes: "Take after breakfast and dinner with a full glass of water.", status: "Active" as const },
//   { name: "Amoxicillin", type: "capsule", dosage: { value: 250, unit: "mg" }, scheduleType: "Three Times" as const, times: ["08:00", "14:00", "20:00"], startDate: new Date("2023-10-01"), endDate: new Date("2023-10-14"), notes: "Complete the full course even if feeling better.", status: "Active" as const },
//   { name: "Vitamin C", type: "pill", dosage: { value: 1000, unit: "mg" }, scheduleType: "Once Daily" as const, times: ["08:00"], startDate: new Date("2023-09-01"), notes: "Take in the morning.", status: "Active" as const },
//   { name: "Lisinopril", type: "pill", dosage: { value: 10, unit: "mg" }, scheduleType: "Once Daily" as const, times: ["08:00"], startDate: new Date("2023-01-01"), notes: "Blood pressure medication. Do not skip.", status: "Active" as const },
//   { name: "Multivitamin", type: "pill", dosage: { value: 1, unit: "tablet" }, scheduleType: "Once Daily" as const, times: ["12:00"], startDate: new Date("2023-01-01"), status: "Active" as const },
//   { name: "Magnesium Glycinate", type: "pill", dosage: { value: 400, unit: "mg" }, scheduleType: "Once Daily" as const, times: ["21:00"], startDate: new Date("2023-06-01"), notes: "Take before bed.", status: "Active" as const },
// ];

// function buildDoseLogs(userId: mongoose.Types.ObjectId, meds: any[]) {
//   const logs: any[] = [];
//   const now = new Date();
//   for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
//     const day = new Date(now);
//     day.setDate(now.getDate() - dayOffset);
//     for (const med of meds) {
//       for (const timeStr of med.times) {
//         const [h, m] = timeStr.split(":").map(Number);
//         const scheduledTime = new Date(day);
//         scheduledTime.setHours(h, m, 0, 0);
//         const isPast = scheduledTime < now;
//         let status: "TAKEN" | "MISSED" | "SKIPPED" | "UPCOMING";
//         if (!isPast) { status = "UPCOMING"; }
//         else { const r = Math.random(); status = r < 0.82 ? "TAKEN" : r < 0.93 ? "MISSED" : "SKIPPED"; }
//         logs.push({ userId, medicationId: med._id, scheduledTime, status, takenAt: status === "TAKEN" ? scheduledTime : undefined });
//       }
//     }
//   }
//   return logs;
// }

// async function seed() {
//   await mongoose.connect(process.env.MONGO_URI as string);
//   console.log("✅ Connected");
//   const existing = await User.findById(SEED_GUEST_ID);
//   if (existing) {
//     await DoseLog.deleteMany({ userId: SEED_GUEST_ID });
//     await Medication.deleteMany({ userId: SEED_GUEST_ID });
//     await User.findByIdAndDelete(SEED_GUEST_ID);
//     console.log("🗑  Cleared old seed data");
//   }
//   const user = await User.create({ _id: new mongoose.Types.ObjectId(SEED_GUEST_ID), fullName: "Chioma Adeyemi", email: "chioma@dosemate.local", phoneNumber: "+234 802 345 6789", gender: "Female", dateOfBirth: new Date("1994-05-12"), settings: { highPriorityAlarms: true, dailyReminders: true } });
//   console.log(`👤 User: ${user.fullName}`);
//   const meds = await Medication.insertMany(MEDICATIONS.map(m => ({ ...m, userId: user._id })));
//   console.log(`💊 ${meds.length} medications`);
//   const logs = buildDoseLogs(user._id, meds as any);
//   await DoseLog.insertMany(logs);
//   console.log(`📋 ${logs.length} dose logs`);
//   console.log(`\n✅ Done! Guest ID: ${SEED_GUEST_ID}`);
//   await mongoose.disconnect();
// }

// seed().catch(e => { console.error(e); process.exit(1); });




// Run: npx ts-node scripts/seed.ts
import dotenv from "dotenv";
import mongoose from "mongoose";
import DoseLog from "../src/models/doseLog";
import Medication from "../src/models/medication";
import User from "../src/models/user";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SEED_GUEST_ID = "000000000000000000000001";

const MEDICATIONS = [
  { name: "Omega-3", type: "capsule", dosage: { value: 1000, unit: "mg" }, scheduleType: "Once Daily" as const, times: ["08:00"], startDate: new Date("2024-01-01"), notes: "Take with breakfast.", status: "Active" as const },
  { name: "Iron Supplement", type: "pill", dosage: { value: 65, unit: "mg" }, scheduleType: "Once Daily" as const, times: ["12:00"], startDate: new Date("2024-03-01"), notes: "Avoid coffee for 1 hour after taking.", status: "Active" as const },
  { name: "Metformin", type: "pill", dosage: { value: 500, unit: "mg" }, scheduleType: "Morning & Evening" as const, times: ["07:30", "19:30"], startDate: new Date("2024-01-15"), status: "Active" as const },
  { name: "Zinc", type: "pill", dosage: { value: 50, unit: "mg" }, scheduleType: "Once Daily" as const, times: ["09:00"], startDate: new Date("2024-04-01"), status: "Active" as const },
];

function buildDoseLogs(userId: mongoose.Types.ObjectId, meds: any[]) {
  const logs: any[] = [];
  const today = new Date("2026-04-19"); // Current date context
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const endOfApril = new Date("2026-04-30T23:59:59");

  // Iterate from Yesterday to End of April
  for (let d = new Date(yesterday); d <= endOfApril; d.setDate(d.getDate() + 1)) {
    for (const med of meds) {
      for (const timeStr of med.times) {
        const [h, m] = timeStr.split(":").map(Number);
        const scheduledTime = new Date(d);
        scheduledTime.setHours(h, m, 0, 0);

        const isPast = scheduledTime < today;
        let status: "TAKEN" | "MISSED" | "SKIPPED" | "UPCOMING";
        
        if (!isPast) { 
          status = "UPCOMING"; 
        } else { 
          const r = Math.random(); 
          status = r < 0.85 ? "TAKEN" : r < 0.95 ? "MISSED" : "SKIPPED"; 
        }

        logs.push({ 
          userId, 
          medicationId: med._id, 
          scheduledTime, 
          status, 
          takenAt: status === "TAKEN" ? scheduledTime : undefined 
        });
      }
    }
  }
  return logs;
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("✅ Connected to Database");

  const existing = await User.findById(SEED_GUEST_ID);
  if (existing) {
    await DoseLog.deleteMany({ userId: SEED_GUEST_ID });
    await Medication.deleteMany({ userId: SEED_GUEST_ID });
    await User.findByIdAndDelete(SEED_GUEST_ID);
    console.log("🗑 Cleared old data");
  }

  const user = await User.create({ 
    _id: new mongoose.Types.ObjectId(SEED_GUEST_ID), 
    fullName: "Amina Okoro", 
    email: "amina@dosemate.local", 
    phoneNumber: "+234 901 222 3333", 
    gender: "Female", 
    dateOfBirth: new Date("1992-11-20"), 
    settings: { highPriorityAlarms: true, dailyReminders: true } 
  });

  const meds = await Medication.insertMany(MEDICATIONS.map(m => ({ ...m, userId: user._id })));
  const logs = buildDoseLogs(user._id, meds as any);
  await DoseLog.insertMany(logs);

  console.log(`✅ Seeded: ${meds.length} Meds and ${logs.length} Logs until end of April.`);
  await mongoose.disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });