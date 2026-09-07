import crypto from "crypto";
import YapSession from "../models/yapSession.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

// Helper: Generate collision-free 6-char unguessable alphanumeric code (A-Z, 2-9 avoiding O, 0, I, 1)
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateUniqueSessionCode = async () => {
  let attempts = 0;
  while (attempts < 10) {
    const bytes = crypto.randomBytes(6);
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
    }

    const existing = await YapSession.findOne({ sessionCode: code });
    if (!existing) {
      return code;
    }
    attempts++;
  }
  // Fallback timestamp slice
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};

export const createSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const { friendIds } = req.body;

    const sessionCode = await generateUniqueSessionCode();

    const newSession = new YapSession({
      sessionCode,
      createdBy: userId,
      participants: [userId],
      activeParticipants: [userId],
      status: "waiting",
    });

    await newSession.save();

    await newSession.populate([
      { path: "createdBy", select: "fullName username profilePic" },
      { path: "participants", select: "fullName username profilePic" },
      { path: "activeParticipants", select: "fullName username profilePic" },
    ]);

    // If friend IDs provided at creation, send invites via Socket.IO
    if (Array.isArray(friendIds) && friendIds.length > 0) {
      friendIds.forEach((friendId) => {
        const receiverSocketId = getReceiverSocketId(friendId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("yapSessionInvite", {
            sessionId: newSession._id,
            sessionCode: newSession.sessionCode,
            inviterId: userId,
            inviterName: req.user.fullName,
            inviterProfilePic: req.user.profilePic,
          });
        }
      });
    }

    res.status(201).json(newSession);
  } catch (error) {
    console.error("Error in createSession controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const joinSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionCode } = req.body;

    if (!sessionCode || typeof sessionCode !== "string") {
      return res.status(400).json({ message: "Session code is required" });
    }

    const cleanedCode = sessionCode.trim().toUpperCase();

    const session = await YapSession.findOne({
      sessionCode: cleanedCode,
      status: { $ne: "ended" },
    });

    if (!session) {
      return res.status(404).json({ message: "Yap Session not found or has already ended" });
    }

    // Add to participants if not already present
    if (!session.participants.some((p) => p.toString() === userId.toString())) {
      session.participants.push(userId);
    }

    // Add to activeParticipants if not already present
    if (!session.activeParticipants.some((p) => p.toString() === userId.toString())) {
      session.activeParticipants.push(userId);
    }

    session.status = "active";
    await session.save();

    await session.populate([
      { path: "createdBy", select: "fullName username profilePic" },
      { path: "participants", select: "fullName username profilePic" },
      { path: "activeParticipants", select: "fullName username profilePic" },
    ]);

    // Broadcast participant update to room
    io.to(`yap_${session._id}`).emit("yapParticipantUpdate", {
      sessionId: session._id,
      participants: session.participants,
      activeParticipants: session.activeParticipants,
    });

    res.status(200).json(session);
  } catch (error) {
    console.error("Error in joinSession controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const inviteFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId, friendIds } = req.body;

    if (!sessionId || !Array.isArray(friendIds) || friendIds.length === 0) {
      return res.status(400).json({ message: "Session ID and friend IDs are required" });
    }

    const session = await YapSession.findById(sessionId);
    if (!session || session.status === "ended") {
      return res.status(404).json({ message: "Yap Session not found or inactive" });
    }

    // Validate caller is a participant
    const isParticipant = session.participants.some((p) => p.toString() === userId.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: "You must be a participant to invite others" });
    }

    let invitedCount = 0;
    friendIds.forEach((friendId) => {
      const receiverSocketId = getReceiverSocketId(friendId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("yapSessionInvite", {
          sessionId: session._id,
          sessionCode: session.sessionCode,
          inviterId: userId,
          inviterName: req.user.fullName,
          inviterProfilePic: req.user.profilePic,
        });
        invitedCount++;
      }
    });

    res.status(200).json({
      message: `Sent ${invitedCount} invite(s) successfully`,
      invitedCount,
    });
  } catch (error) {
    console.error("Error in inviteFriends controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const leaveSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const session = await YapSession.findById(sessionId);
    if (!session) {
      return res.status(200).json({ message: "Session already ended" });
    }

    session.activeParticipants = session.activeParticipants.filter(
      (p) => p.toString() !== userId.toString()
    );

    // If no active participants remain, immediately terminate and delete session document
    if (session.activeParticipants.length === 0) {
      io.to(`yap_${sessionId}`).emit("yapSessionEnded", {
        sessionId,
        reason: "All participants left",
      });
      await YapSession.findByIdAndDelete(sessionId);
      return res.status(200).json({ message: "Session ended and permanently cleared", sessionEnded: true });
    }

    await session.save();

    await session.populate([
      { path: "participants", select: "fullName username profilePic" },
      { path: "activeParticipants", select: "fullName username profilePic" },
    ]);

    // Broadcast participant update to remaining members
    io.to(`yap_${sessionId}`).emit("yapParticipantUpdate", {
      sessionId,
      participants: session.participants,
      activeParticipants: session.activeParticipants,
    });

    res.status(200).json({ message: "Left session successfully", sessionEnded: false });
  } catch (error) {
    console.error("Error in leaveSession controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const endSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const session = await YapSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Only creator can explicitly terminate the entire session
    if (session.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the session creator can end the session for everyone" });
    }

    // Broadcast termination signal to all participants in the room
    io.to(`yap_${sessionId}`).emit("yapSessionEnded", {
      sessionId,
      reason: "Session was ended by creator",
    });

    // Destroy database record immediately (zero-trace)
    await YapSession.findByIdAndDelete(sessionId);

    res.status(200).json({ message: "Yap Session ended and shredded successfully" });
  } catch (error) {
    console.error("Error in endSession controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await YapSession.findById(sessionId).populate([
      { path: "createdBy", select: "fullName username profilePic" },
      { path: "participants", select: "fullName username profilePic" },
      { path: "activeParticipants", select: "fullName username profilePic" },
    ]);

    if (!session || session.status === "ended") {
      return res.status(404).json({ message: "Yap Session not found or has ended" });
    }

    res.status(200).json(session);
  } catch (error) {
    console.error("Error in getSession controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
