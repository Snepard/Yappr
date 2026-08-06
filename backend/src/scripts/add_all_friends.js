import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/user.model.js";

dotenv.config();

const addAllFriends = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is not set in environment variables");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Assign default usernames to any existing users missing a username
    const allUsers = await User.find({});
    for (const u of allUsers) {
      if (!u.username) {
        const defaultUsername = (u.email ? u.email.split("@")[0] : `user_${u._id.toString().slice(-4)}`).toLowerCase();
        await User.updateOne({ _id: u._id }, { $set: { username: defaultUsername } });
        console.log(`Assigned default username '${defaultUsername}' to user ${u.email}`);
      }
    }

    const targetEmail = "aryansingh532006@gmail.com";
    const targetUser = await User.findOne({ email: targetEmail });

    if (!targetUser) {
      console.error(`User with email '${targetEmail}' not found!`);
      process.exit(1);
    }

    const otherUsers = await User.find({ _id: { $ne: targetUser._id } });
    const otherUserIds = otherUsers.map((u) => u._id);

    // Add all other user IDs to targetUser's friends array
    await User.updateOne(
      { _id: targetUser._id },
      { $addToSet: { friends: { $each: otherUserIds } } }
    );

    // Add targetUser's ID to all other users' friends array
    await User.updateMany(
      { _id: { $in: otherUserIds } },
      { $addToSet: { friends: targetUser._id } }
    );

    console.log(`Successfully added all ${otherUserIds.length} users as friends for ${targetEmail}`);
    process.exit(0);
  } catch (error) {
    console.error("Error adding friends:", error);
    process.exit(1);
  }
};

addAllFriends();
