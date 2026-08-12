import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

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

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, app, server };