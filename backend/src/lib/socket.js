import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import YapSession from "../models/yapSession.model.js";

const parseCookie = cookie.parseCookie || cookie.parse;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === "production" 
            ? [process.env.CLIENT_URL || "https://your-app-name.onrender.com"]
            : ["http://localhost:5173"],
        credentials: true,
    }
});

export function getReceiverSocketId(userID) {
    return userSocketMap[userID];
}

export function getUserOnlineSockets(userIds) {
    const socketIds = [];
    userIds.forEach((id) => {
        const socketId = userSocketMap[id?.toString()];
        if (socketId) socketIds.push(socketId);
    });
    return socketIds;
}

const userSocketMap = {};    //{userId: socketId}

// Socket.IO authentication middleware via JWT cookie
io.use((socket, next) => {
    try {
        const rawCookies = socket.request.headers.cookie;
        if (!rawCookies) {
            return next(new Error("Authentication error: No cookies found"));
        }

        const parsedCookies = parseCookie(rawCookies);
        const token = parsedCookies.jwt;

        if (!token) {
            return next(new Error("Authentication error: Token missing"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            return next(new Error("Authentication error: Invalid token"));
        }

        socket.userId = decoded.userId;
        next();
    } catch (err) {
        console.error("Socket authentication failed:", err.message);
        next(new Error("Authentication error"));
    }
});

io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log("Authenticated user connected via socket:", userId, socket.id);

    if (userId) userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Handle joining group rooms
    socket.on("joinGroupRoom", (groupId) => {
        if (groupId) {
            socket.join(`group_${groupId}`);
            console.log(`User ${userId} joined room group_${groupId}`);
        }
    });

    socket.on("leaveGroupRoom", (groupId) => {
        if (groupId) {
            socket.leave(`group_${groupId}`);
            console.log(`User ${userId} left room group_${groupId}`);
        }
    });

    // ==========================================
    // Ephemeral Yap Session Socket Event Handlers
    // ==========================================
    socket.on("joinYapRoom", async ({ sessionId, ephemeralPublicKey, user }) => {
        if (!sessionId) return;
        const roomName = `yap_${sessionId}`;
        socket.join(roomName);
        socket.yapSessionId = sessionId;
        console.log(`User ${userId} joined Yap room ${roomName}`);

        // Announce to other participants in the room that a new peer joined with their ephemeral public key
        socket.to(roomName).emit("yapParticipantJoined", {
            userId,
            socketId: socket.id,
            ephemeralPublicKey,
            user,
            sessionId,
        });
    });

    socket.on("yapKeyAnnounce", ({ sessionId, targetUserId, ephemeralPublicKey }) => {
        if (!sessionId) return;
        const roomName = `yap_${sessionId}`;
        
        if (targetUserId) {
            const targetSocketId = userSocketMap[targetUserId];
            if (targetSocketId) {
                io.to(targetSocketId).emit("yapKeyAnnounce", {
                    sessionId,
                    fromUserId: userId,
                    ephemeralPublicKey,
                });
            }
        } else {
            socket.to(roomName).emit("yapKeyAnnounce", {
                sessionId,
                fromUserId: userId,
                ephemeralPublicKey,
            });
        }
    });

    socket.on("sendYapMessage", ({ sessionId, messagePayload }) => {
        if (!sessionId || !messagePayload) return;
        const roomName = `yap_${sessionId}`;
        // Zero-trace broadcast to other participants in the room — NEVER saved to DB
        socket.to(roomName).emit("yapMessage", messagePayload);
    });

    socket.on("leaveYapRoom", async ({ sessionId }) => {
        if (!sessionId) return;
        const roomName = `yap_${sessionId}`;
        socket.leave(roomName);
        if (socket.yapSessionId === sessionId) {
            delete socket.yapSessionId;
        }
        console.log(`User ${userId} left Yap room ${roomName}`);

        socket.to(roomName).emit("yapParticipantLeft", {
            userId,
            sessionId,
        });
    });

    socket.on("disconnect", async () => {
        console.log("User disconnected:", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        // Automatic cleanup if user disconnected while in an active Yap session
        if (socket.yapSessionId && userId) {
            try {
                const sId = socket.yapSessionId;
                const roomName = `yap_${sId}`;
                const session = await YapSession.findById(sId);
                if (session) {
                    session.activeParticipants = session.activeParticipants.filter(
                        (p) => p.toString() !== userId.toString()
                    );
                    if (session.activeParticipants.length === 0) {
                        io.to(roomName).emit("yapSessionEnded", {
                            sessionId: sId,
                            reason: "All participants left",
                        });
                        await YapSession.findByIdAndDelete(sId);
                    } else {
                        await session.save();
                        io.to(roomName).emit("yapParticipantLeft", {
                            userId,
                            sessionId: sId,
                            activeParticipants: session.activeParticipants,
                        });
                    }
                }
            } catch (err) {
                console.error("Error during socket disconnect yap cleanup:", err);
            }
        }
    });
});

export { io, app, server };