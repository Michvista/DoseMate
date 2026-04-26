import mongoose, { Schema, Document } from "mongoose";

export interface IDoseLog extends Document {
  userId: mongoose.Types.ObjectId;
  medicationId: mongoose.Types.ObjectId;
  scheduledTime: Date;
  status: "TAKEN" | "MISSED" | "SKIPPED" | "UPCOMING";
  takenAt?: Date;
}

const DoseLogSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    medicationId: {
      type: Schema.Types.ObjectId,
      ref: "Medication",
      required: true,
    },
    scheduledTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["TAKEN", "MISSED", "SKIPPED", "UPCOMING"],
      default: "UPCOMING",
    },
    takenAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model<IDoseLog>("DoseLog", DoseLogSchema);
