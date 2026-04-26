import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  googleId?: string;
  phoneNumber?: string;
  gender?: "Female" | "Male" | "Other";
  dateOfBirth?: Date;
  profileImage?: string;
  settings: {
    highPriorityAlarms: boolean;
    dailyReminders: boolean;
  };
}

const UserSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    googleId: String,
    phoneNumber: String,
    gender: { type: String, enum: ["Female", "Male", "Other"] },
    dateOfBirth: Date,
    profileImage: String,
    settings: {
      highPriorityAlarms: { type: Boolean, default: true },
      dailyReminders: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
