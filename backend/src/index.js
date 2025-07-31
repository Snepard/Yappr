import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import {connectDB} from "./lib/db.js"
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// CORS configuration - fix for production
app.use(cors({
    origin: process.env.NODE_ENV === "production" 
        ? process.env.CLIENT_URL || "https://your-app-name.onrender.com"  // Replace with your actual Render URL
        : "http://localhost:5173",
    credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// API routes first
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Production static files and catch-all
if(process.env.NODE_ENV === "production"){
    // Serve static files from the React app build directory
    // Note: Going up two levels since we're in backend/src/
    app.use(express.static(path.join(__dirname, "../../frontend/dist")));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, "../../frontend/dist/index.html"));
    });
} else {
    // Development route
    app.get("/", (req, res) => {
        res.send("API is running in development mode");
    });
}

server.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
    connectDB();
});