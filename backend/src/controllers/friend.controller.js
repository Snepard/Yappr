import User from "../models/user.model.js";
import FriendRequest from "../models/friendRequest.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const myId = req.user._id;

    if (!query || query.trim() === "") {
      return res.status(200).json([]);
    }

    const cleanQuery = query.trim().replace(/^@/, "");
    const searchRegex = new RegExp(cleanQuery, "i");

    const users = await User.find({
      _id: { $ne: myId },
      $or: [{ username: searchRegex }, { fullName: searchRegex }],
    })
      .select("-password")
      .lean();

    const currentUser = await User.findById(myId).select("friends").lean();
    const myFriendIds = (currentUser?.friends || []).map((id) => id.toString());

    // Fetch all relevant friend requests involving me
    const requests = await FriendRequest.find({
      $or: [{ sender: myId }, { receiver: myId }],
      status: "pending",
    }).lean();

    const usersWithStatus = users.map((user) => {
      const userIdStr = user._id.toString();

      let status = "none";
      if (myFriendIds.includes(userIdStr)) {
        status = "friends";
      } else {
        const sentReq = requests.find((r) => r.receiver.toString() === userIdStr);
        const receivedReq = requests.find((r) => r.sender.toString() === userIdStr);

        if (sentReq) status = "pending_sent";
        else if (receivedReq) status = "pending_received";
      }

      return {
        ...user,
        relationshipStatus: status,
      };
    });

    res.status(200).json(usersWithStatus);
  } catch (error) {
    console.error("Error in searchUsers controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself" });
    }

    const targetUser = await User.findById(receiverId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already friends
    const currentUser = await User.findById(senderId);
    if (currentUser.friends?.includes(receiverId)) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }

    // Check existing request
    const existingReq = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existingReq) {
      if (existingReq.status === "pending") {
        return res.status(400).json({ message: "Friend request is already pending" });
      }
    }

    const newRequest = new FriendRequest({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    await newRequest.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newFriendRequest", {
        _id: newRequest._id,
        sender: {
          _id: currentUser._id,
          fullName: currentUser.fullName,
          username: currentUser.username,
          profilePic: currentUser.profilePic,
        },
      });
    }

    res.status(201).json({ message: "Friend request sent successfully", request: newRequest });
  } catch (error) {
    console.error("Error in sendFriendRequest controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const myId = req.user._id;

    const requests = await FriendRequest.find({ receiver: myId, status: "pending" })
      .populate("sender", "fullName username profilePic email")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error in getFriendRequests controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const myId = req.user._id;

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (request.receiver.toString() !== myId.toString()) {
      return res.status(403).json({ message: "Not authorized to accept this request" });
    }

    request.status = "accepted";
    await request.save();

    // Add each other to friends array
    await User.findByIdAndUpdate(myId, { $addToSet: { friends: request.sender } });
    await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: myId } });

    const senderSocketId = getReceiverSocketId(request.sender.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("friendRequestAccepted", {
        acceptedBy: req.user,
      });
    }

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const myId = req.user._id;

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (request.receiver.toString() !== myId.toString()) {
      return res.status(403).json({ message: "Not authorized to decline this request" });
    }

    await FriendRequest.findByIdAndDelete(requestId);

    res.status(200).json({ message: "Friend request declined" });
  } catch (error) {
    console.error("Error in declineFriendRequest controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getRecommendedFriends = async (req, res) => {
  try {
    const myId = req.user._id;

    // Fetch my user to get direct friends list
    const currentUser = await User.findById(myId).select("friends").lean();
    const myFriendIds = (currentUser?.friends || []).map((id) => id.toString());

    if (myFriendIds.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch all friends of my direct friends
    const friendsOfFriends = await User.find({
      _id: { $in: myFriendIds },
    })
      .select("friends")
      .lean();

    // Map candidate user IDs -> count of mutual friends
    const mutualCountMap = {};

    friendsOfFriends.forEach((f) => {
      (f.friends || []).forEach((candidateId) => {
        const candidateIdStr = candidateId.toString();
        // Candidate must not be me and must not already be my direct friend
        if (candidateIdStr !== myId.toString() && !myFriendIds.includes(candidateIdStr)) {
          mutualCountMap[candidateIdStr] = (mutualCountMap[candidateIdStr] || 0) + 1;
        }
      });
    });

    const candidateIds = Object.keys(mutualCountMap);

    if (candidateIds.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch candidate user details
    const candidateUsers = await User.find({
      _id: { $in: candidateIds },
    })
      .select("-password")
      .lean();

    // Fetch pending friend requests involving me
    const requests = await FriendRequest.find({
      $or: [{ sender: myId }, { receiver: myId }],
      status: "pending",
    }).lean();

    const recommendedUsers = candidateUsers.map((user) => {
      const userIdStr = user._id.toString();
      const sentReq = requests.find((r) => r.receiver.toString() === userIdStr);
      const receivedReq = requests.find((r) => r.sender.toString() === userIdStr);

      let status = "none";
      if (sentReq) status = "pending_sent";
      else if (receivedReq) status = "pending_received";

      return {
        ...user,
        mutualFriendsCount: mutualCountMap[userIdStr] || 0,
        relationshipStatus: status,
      };
    });

    // Sort candidates by highest mutual friend count first
    recommendedUsers.sort((a, b) => b.mutualFriendsCount - a.mutualFriendsCount);

    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedFriends controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
