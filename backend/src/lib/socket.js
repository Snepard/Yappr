import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import cookie from "cookie";

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

const userSocketMap = {};    //{userId: socketId}

// Socket.IO authentication middleware via JWT cookie
io.use((socket, next) => {
    try {
        const rawCookies = socket.request.headers.cookie;
        if (!rawCookies) {
            return next(new Error("Authentication error: No cookies found"));
        }

        const parsedCookies = cookie.parse(rawCookies);
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

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, app, server };