import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    groupPic: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    permissions: {
      allowMembersToEditGroupInfo: {
        type: Boolean,
        default: true,
      },
      allowMembersToSendMessages: {
        type: Boolean,
        default: true,
      },
      allowMembersToAddOthers: {
        type: Boolean,
        default: false,
      },
    },
    timeouts: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        until: {
          type: Date,
          required: true,
        },
        setBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true }
);

groupSchema.index({ members: 1 });

const Group = mongoose.model("Group", groupSchema);

export default Group;
