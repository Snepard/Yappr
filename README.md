<div align="center">
  <img src="frontend/public/YapprIcon.png" alt="Yappr Logo" width="120"/>

  <h1 align="center">Yappr</h1>

  <p align="center">
    <strong>Chat. Connect. Converse.</strong><br/>
    A modern real-time chat application built for seamless and instant communication.
  </p>

  <p align="center">
    <a href="https://reactjs.org/">
      <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white"/>
    </a>
    <a href="https://nodejs.org/">
      <img alt="Node.js" src="https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white"/>
    </a>
    <a href="https://socket.io/">
      <img alt="Socket.io" src="https://img.shields.io/badge/Socket.io-Real--Time-010101?logo=socketdotio&logoColor=white"/>
    </a>
    <a href="https://www.mongodb.com/">
      <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white"/>
    </a>
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
- **Secure Signup & Login:** Protected via JWT (JSON Web Tokens).
- **Password Protection:** Passwords are hashed using bcrypt before storage.
- **Route Guards:** Prevents unauthorized access to private chats.

### ⚡ Real-Time Messaging
- **Instant Delivery:** Powered by **Socket.io** for low-latency communication.
- **Online Status:** See who is currently active in real-time.
- **Live Updates:** Messages appear instantly without refreshing.

### 💾 Persistent Data
- **Chat History:** All conversations are stored in **MongoDB**.
- **Session Restoration:** Chats remain available even after you close the browser.

### 👤 User Experience
- **User Search:** Find and start conversations with other users.
- **Responsive Design:** Fully optimized for desktop and mobile devices.
- **Clean UI:** Built with **Tailwind CSS** for a modern look and feel.

---

## 🧩 Tech Stack

### **Frontend (Client)**
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS + DaisyUI
- **State Management:** Zustand
- **API Client:** Axios
- **Icons:** React Icons

### **Backend (Server)**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Real-Time Engine:** Socket.io
- **Auth:** JWT + bcryptjs

---

## 🔄 System Architecture

1. **Authentication:** User logs in → Server verifies credentials → Issues HTTP-only Cookie/JWT.
2. **Connection:** Client establishes a bidirectional WebSocket connection via Socket.io.
3. **Messaging:**
   - **Sender:** Emits `sendMessage` event.
   - **Server:** Saves message to MongoDB and broadcasts to the specific `receiverId`.
   - **Receiver:** Listens for `newMessage` event and updates UI instantly.

---

## 📁 Repository Structure

```bash
Yappr/
│
├── frontend/                 # React client (Vite)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Login, Signup, Home pages
│   │   ├── store/            # Zustand state stores
│   │   └── context/          # Socket context
│   └── public/               # Static assets
│
├── backend/                  # Node.js + Express server
│   ├── controllers/          # Route logic
│   ├── middleware/           # ProtectRoute middleware
│   ├── models/               # Mongoose schemas (User, Message)
│   ├── routes/               # API endpoints
│   ├── socket/               # Socket.io logic
│   └── server.js             # Entry point
│
└── README.md
```
---

## 🚀 Running Locally
Follow these steps to set up Yappr on your machine.     
1️⃣ Clone the Repository
```bash
git clone [https://github.com/Snepard/Yappr.git](https://github.com/Snepard/Yappr.git)
cd Yappr
```

2️⃣ Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```
Create a .env file in the backend folder:
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```
Start the server:
```bash
npm run dev
```
3️⃣ Frontend Setup
Open a new terminal, navigate to the frontend folder, and install dependencies:
```bash
cd ../frontend
npm install
```

Start the client:
```bash
npm run dev
Visit http://localhost:5173 (or the port shown in your terminal) to view the app.
```
---
## 🧠 Author’s Note
Yappr was built to explore the intricacies of WebSocket communication and scalable backend architecture. It serves as a solid foundation that can be easily extended with features like group chats, file sharing, and read receipts.
---
## 🧾 License
This project is licensed under the MIT License.
