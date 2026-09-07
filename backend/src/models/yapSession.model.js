import mongoose from "mongoose";

const yapSessionSchema = new mongoose.Schema(
  {
    sessionCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    activeParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["waiting", "active", "ended"],
      default: "waiting",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // 24-hour TTL safety net for auto-cleanup
    },
  },
  { timestamps: true }
);

yapSessionSchema.index({ activeParticipants: 1 });

const YapSession = mongoose.model("YapSession", yapSessionSchema);

export default YapSession;
