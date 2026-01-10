<div align="center">
  <img src="frontend/public/YapprIcon.png" alt="Yappr Logo" width="200"/>

  <h1 align="center">Yappr</h1>

  <p align="center">
    <strong>Chat. Connect. Converse.</strong><br/>
    A modern real-time chat application built for seamless and instant communication.
  </p>

  <p align="center">
    <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white"/>
    <img alt="Node.js" src="https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white"/>
    <img alt="Socket.io" src="https://img.shields.io/badge/Socket.io-Real--Time-010101?logo=socketdotio&logoColor=white"/>
    <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white"/>
    <img alt="JWT" src="https://img.shields.io/badge/Auth-JWT-orange"/>
  </p>
</div>

---

## 💬 Overview

**Yappr** is a full-stack **real-time chat application** that enables users to communicate instantly with a clean, responsive, and intuitive interface.

It supports:
- Secure user authentication
- One-to-one real-time messaging
- Persistent chat history
- Online user presence
- Smooth UI interactions

This project showcases **real-time systems**, **socket-based communication**, and **modern full-stack development** practices.

---

## ✨ Key Features

### 🔐 Authentication & Security
- User signup & login
- Password hashing
- JWT-based authentication
- Protected routes

### ⚡ Real-Time Messaging
- Instant message delivery using **Socket.io**
- Typing indicators (if implemented)
- Live user presence updates

### 💾 Persistent Chat History
- Messages stored in **MongoDB**
- Chats remain available after refresh or relogin

### 👤 User Management
- Search users
- Start private conversations
- View online/offline status

### 🎨 Modern UI
- Responsive design
- Clean chat layout
- Smooth transitions for better UX

---

## 🧩 Tech Stack

### **Frontend (Client)**
- ⚛️ React (Vite)
- 🎨 CSS / Tailwind (if used)
- 🌐 Axios for API communication
- 🔄 Context API for state management

### **Backend (Server)**
- 🟢 Node.js + Express
- 🗃️ MongoDB + Mongoose
- 🔐 JWT Authentication
- 🔑 bcrypt for password hashing
- 🔌 Socket.io for real-time communication

---

## 🔄 How Yappr Works (Flow)

1. **User Registers / Logs In**
   - Credentials verified
   - JWT issued and stored securely

2. **Socket Connection Established**
   - User joins socket room
   - Online status broadcasted

3. **Start Chat**
   - User selects another user
   - Private chat room created

4. **Send Message**
   - Message emitted via Socket.io
   - Stored in MongoDB
   - Delivered instantly to recipient

5. **Receive Message**
   - UI updates in real-time
   - Message persists in chat history

---

## 📁 Repository Structure

```bash
Yappr/
│
├── frontend/                 # React client
│   ├── src/
│   └── public/
│
├── backend/                  # Node.js + Express server
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── socket/
│
└── README.md
```
---

## 🚀 Running Locally
1️⃣ Clone the Repository
```bash
git clone https://github.com/Snepard/Yappr.git
cd Yappr
```

2️⃣ Backend Setup
```bash
cd backend
npm install
npm run dev
```

Create a .env file:
```bash
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key
```

3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
---
## 🧠 Author’s Note
Yappr was built to deeply understand:
 - Real-time systems
 - WebSocket communication
 - Scalable backend architecture
 - Clean UI/UX for chat-based apps
 - It’s a solid foundation that can be extended with group chats, media sharing, read receipts, and notifications.

---
## 🧾 License
This project is licensed under the MIT License.
