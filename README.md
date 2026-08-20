<div align="center">
  <img src="frontend/public/YapprIcon.png" alt="Yappr Logo" width="120"/>

  <h1 align="center">Yappr</h1>

  <p align="center">
    <strong>Private. Real-Time. Zero-Knowledge.</strong><br/>
    A modern, secure real-time messaging platform powered by Client-Side End-to-End Encryption (E2EE), ECDH Key Agreement, and AES-256-GCM.
  </p>

  <p align="center">
    <a href="https://react.dev/">
      <img alt="React 19" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white"/>
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API">
      <img alt="Web Crypto API" src="https://img.shields.io/badge/Security-Web_Crypto_API-blue?logo=shield&logoColor=white"/>
    </a>
    <a href="https://en.wikipedia.org/wiki/Elliptic-curve_Diffie%E2%80%93Hellman">
      <img alt="ECDH P-256" src="https://img.shields.io/badge/E2EE-ECDH_P--256-green"/>
    </a>
    <a href="https://en.wikipedia.org/wiki/Galois/Counter_Mode">
      <img alt="AES-256-GCM" src="https://img.shields.io/badge/Cipher-AES--256--GCM-brightgreen"/>
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
    <img alt="Auth" src="https://img.shields.io/badge/Auth-JWT_HttpOnly-orange"/>
  </p>
</div>

---

## 🔒 Security & Privacy Architecture

Yappr is engineered from the ground up on a **Zero-Knowledge Security Architecture**. Conversations are protected using cryptographic primitives running natively in the client's browser. The server acts exclusively as an encrypted relay and storage layer, with zero access to private keys or plaintext communications.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            CLIENT (Browser)                              │
│                                                                          │
│  [Plaintext Message] ──> [AES-256-GCM + 12-Byte IV] ──> [Ciphertext]    │
│                                   ▲                                      │
│                                   │ Shared Key                           │
│  [My Private Key (ECDH)] ─────────┴─────────── [Recipient's Public Key]  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                         POST /api/messages/send
                        (Ciphertext Base64 + IV)
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           YAPPR SERVER & DB                              │
│                                                                          │
│  • Stores only Base64 Ciphertext and IV                                  │
│  • NEVER receives or stores raw Private Keys                             │
│  • ZERO visibility into message contents                                 │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Core Cryptographic & Privacy Highlights

### 1. End-to-End Encryption (E2EE)
* **Asymmetric Key Agreement (ECDH P-256):** Users generate an Elliptic Curve Diffie-Hellman (ECDH) keypair over the NIST P-256 curve directly in their browser using the native Web Crypto API (`window.crypto.subtle`).
* **Authenticated Symmetric Encryption (AES-GCM-256):** Each direct conversation derives a shared 256-bit symmetric key. Messages are encrypted with AES-GCM using cryptographically random 12-byte Initialization Vectors (IVs) generated via CSPRNG (`window.crypto.getRandomValues`).
* **Integrity & Anti-Tampering (AEAD):** AES-GCM provides built-in Galois message authentication codes (GMAC). Any payload modification or MITM tampering in transit is automatically detected and rejected during decryption.

### 2. Server-Backed Zero-Knowledge Key Envelope
* **Password-Derived Envelope:** Private keys are protected on the client using a 256-bit Master Key derived via `bcrypt.hash(password, salt) → SHA-256 digest`.
* **Zero-Knowledge Cloud Backup:** The encrypted private key envelope is backed up to MongoDB. When logging in on a new device or incognito window, the client downloads the envelope and decrypts it locally with the user's password.
* **Key Continuity on Password Change:** Changing an account password in settings decrypts the private key and re-encrypts the **exact same key** with the new password. All past, current, and future chat history remains **100% readable**.

### 3. Memorable 6-Digit E2EE Backup PIN
* **Foolproof Account Recovery:** Users configure a memorable 6-digit PIN on signup. A secondary backup envelope is encrypted using this PIN (`bcrypt(PIN) → SHA-256 → AES-GCM`).
* **Seamless Password Resets:** If a user resets a forgotten password via email verification, entering their 6-digit PIN instantly restores their original private key and unlocks all past chat history.
* **Brute-Force Rate Limiting:** The backend automatically enforces rate limiting and temporary lockouts after consecutive failed PIN attempts to eliminate brute-force attack vectors.

### 4. Robust Authentication & Session Hardening
* **HTTP-Only, SameSite Session Cookies:** JWT tokens are issued with `httpOnly: true`, `sameSite: "strict"`, and `secure: true` (in production), protecting sessions against Cross-Site Scripting (XSS) and CSRF attacks.
* **Password Salting:** Passwords are individually salted and hashed with `bcryptjs` (cost factor 10) before database storage.
* **Cryptographic Reset Tokens:** Password reset tokens are generated using 20 cryptographically secure random bytes (`crypto.randomBytes(20)`), hashed with SHA-256 before storage, and configured with 15-minute expirations.

---

## 📋 Security Lifecycle Matrix

| Event / Action | Private Key Behavior | Chat History Accessibility |
| :--- | :--- | :--- |
| **New Device Login** | Decrypted locally from server envelope using password | ✅ **100% Accessible** |
| **Normal Password Change** | Re-encrypted with new password (key bytes remain unchanged) | ✅ **100% Accessible** |
| **Forgot Password + 6-Digit PIN** | Decrypted with 6-digit PIN, re-encrypted with new password | ✅ **100% Accessible** |
| **Forgot Password + Active Device** | Synced from active session over encrypted socket channel | ✅ **100% Accessible** |
| **Forgot Password + No PIN / No Device** | Fresh key pair generated (last resort) | ⚠️ New chats work; old chats locked |

---

## ✨ Features & Capabilities

* 💬 **Real-Time Direct Messaging:** Low-latency bi-directional messaging powered by Socket.io.
* 👥 **Group Conversations:** Full group chat support with customizable admin roles, member permissions, and moderation timeouts.
* 🟢 **Live Presence & Status:** Real-time online status and instant activity updates.
* 🤝 **Friend Request System:** Add, accept, and manage your trusted network of contacts.
* 🎨 **Dual Visual Themes:** Seamlessly toggle between **Default Dark Glassmorphic UI** and **Neubrutalism High-Contrast Mode**.
* 📱 **Responsive Design:** Fully responsive interface optimized across mobile, tablet, and desktop viewports.

---

## 🧩 Tech Stack

### **Client (Frontend)**
* **Framework:** React 19 (Vite)
* **Cryptography:** Native Web Crypto API (`SubtleCrypto`) + `bcryptjs`
* **Styling:** Tailwind CSS + DaisyUI
* **State Management:** Zustand
* **Animations:** Framer Motion + Lucide Icons
* **Networking:** Axios + Socket.io Client

### **Server (Backend)**
* **Runtime:** Node.js (ES Modules)
* **Framework:** Express.js
* **Database:** MongoDB + Mongoose ODM
* **Real-Time Engine:** Socket.io
* **Authentication & Cryptography:** JSON Web Tokens (JWT), `bcryptjs`, Node `crypto`
* **Media Storage:** Cloudinary

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Snepard/Yappr.git
cd Yappr
```

### 2️⃣ Backend Configuration
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Optional: Cloudinary configuration for avatars & images
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Email configuration for password resets
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

Start the backend server:
```bash
npm run dev
```

### 3️⃣ Frontend Configuration
In a separate terminal, navigate to the frontend directory and install dependencies:
```bash
cd ../frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to begin yappin'!

---

## 🧪 Testing the Cryptographic Suite

Yappr includes automated test suites verifying all cryptographic operations, key derivations, tamper rejections, and database persistence:

```bash
# Run client-side E2EE & workflow test suite
node backend/src/scripts/test_e2ee_workflow.js

# Run database & envelope persistence test suite
node backend/src/scripts/test_db_api_e2ee.js
```

---

## 🧾 License

This project is open-source and licensed under the [MIT License](LICENSE).
