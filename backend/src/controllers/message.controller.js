import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Fetch user to get friends list
    const currentUser = await User.findById(loggedInUserId).select("friends").lean();
    const friendIds = currentUser?.friends || [];

    if (friendIds.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch friends using .lean() for minimal overhead
    const filteredUsers = await User.find({ _id: { $in: friendIds } })
      .select("-password")
      .lean();

    // Aggregate to get the latest message timestamp for each direct conversation in a single DB query
    const lastMessages = await Message.aggregate([
      {
        $match: {
          receiverId: { $ne: null },
          $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
        },
      },
      {
        $project: {
          otherParty: {
            $cond: [{ $eq: ["$senderId", loggedInUserId] }, "$receiverId", "$senderId"],
          },
          createdAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$otherParty",
          lastMessageTime: { $first: "$createdAt" },
        },
      },
    ]);

    const lastMessageMap = {};
    lastMessages.forEach((item) => {
      if (item._id) {
        lastMessageMap[item._id.toString()] = item.lastMessageTime;
      }
    });

    const usersWithLastMessage = filteredUsers.map((user) => ({
      ...user,
      lastMessageTime: lastMessageMap[user._id.toString()] || null,
    }));

    res.status(200).json(usersWithLastMessage);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, iv, isEncrypted } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      iv: iv || "",
      isEncrypted: typeof isEncrypted === "boolean" ? isEncrypted : false,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some((m) => m.toString() === userId.toString());
    if (!isMember) {
      return res.status(403).json({ message: "Not authorized to view messages in this group" });
    }

    const messages = await Message.find({ groupId })
      .populate("senderId", "fullName username profilePic email")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getGroupMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, image } = req.body;
    const senderId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some((m) => m.toString() === senderId.toString());
    if (!isMember) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    // Authority Check: Verify if user is currently timed out
    const now = new Date();
    const activeTimeout = (group.timeouts || []).find(
      (t) => t.userId.toString() === senderId.toString() && new Date(t.until) > now
    );

    if (activeTimeout) {
      const remainingMs = new Date(activeTimeout.until).getTime() - now.getTime();
      const remainingMins = Math.ceil(remainingMs / (1000 * 60));
      return res.status(403).json({
        message: `You are currently timed out in this group and cannot send messages. Time remaining: ${remainingMins} min(s)`,
        isTimedOut: true,
        until: activeTimeout.until,
      });
    }

    // Check if group messages are restricted to admins
    const isAdmin = group.admins.some((a) => a.toString() === senderId.toString());
    if (!isAdmin && group.permissions && group.permissions.allowMembersToSendMessages === false) {
      return res.status(403).json({
        message: "Only group admins are permitted to send messages in this group.",
      });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      groupId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "senderId",
      "fullName username profilePic email"
    );

    // Emit real-time group message event to group room
    io.to(`group_${groupId}`).emit("newGroupMessage", populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error in sendGroupMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized to delete this message" });
    }

    message.isDeleted = true;
    message.text = "This message was deleted";
    message.image = "";
    await message.save();

    const deletePayload = {
      messageId,
      senderId: message.senderId.toString(),
      receiverId: message.receiverId ? message.receiverId.toString() : null,
      groupId: message.groupId ? message.groupId.toString() : null,
      isDeleted: true,
      text: "This message was deleted",
    };

    if (message.groupId) {
      io.to(`group_${message.groupId.toString()}`).emit("messageDeleted", deletePayload);
    } else {
      const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
      const senderSocketId = getReceiverSocketId(message.senderId.toString());

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", deletePayload);
      }
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageDeleted", deletePayload);
      }
    }

    res.status(200).json({ message: "Message deleted successfully", messageId, message });
  } catch (error) {
    console.error("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};