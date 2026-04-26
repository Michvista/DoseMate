import mongoose, { Schema, Document } from "mongoose";

export interface IMedication extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: string;
  dosage: {
    value: number;
    unit: string;
  };
  scheduleType: "Once Daily" | "Morning & Evening" | "Three Times";
  times: string[];
  startDate: Date;
  endDate?: Date;
  status: "Active" | "Inactive";
}

const MedicationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    dosage: {
      value: Number,
      unit: String,
    },
    scheduleType: {
      type: String,
      enum: ["Once Daily", "Morning & Evening", "Three Times"],
    },
    times: [String],
    startDate: { type: Date, required: true },
    endDate: Date,
    notes: String,
    status: { type: String, default: "Active" },
  },
  { timestamps: true },
);

export default mongoose.model<IMedication>("Medication", MedicationSchema);
