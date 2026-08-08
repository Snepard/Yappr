// Client-side End-to-End Encryption (E2EE) Utility using Web Crypto API (SubtleCrypto)

const DB_NAME = "Yappr_E2EE_Store";
const STORE_NAME = "private_keys";

// Helpers for ArrayBuffer <-> Base64 conversion
export const arrayBufferToBase64 = (buffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

export const base64ToArrayBuffer = (base64) => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// IndexedDB Helper to persist local Private Key securely in browser storage
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const storePrivateKeyLocally = async (userId, privateKeyJwk) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(privateKeyJwk, userId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getPrivateKeyLocally = async (userId) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(userId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

// 1. Generate ECDH P-256 Keypair
export const generateECDHKeyPair = async () => {
  return await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true, // extractable
    ["deriveKey", "deriveBits"]
  );
};

// 2. Export Keys to JWK format
export const exportKeyToJWK = async (key) => {
  return await window.crypto.subtle.exportKey("jwk", key);
};

// 3. Import Public Key JWK
export const importPublicKeyFromJWK = async (jwk) => {
  return await window.crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    []
  );
};

// 4. Import Private Key JWK
export const importPrivateKeyFromJWK = async (jwk) => {
  return await window.crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"]
  );
};

// 5. Derive Shared AES-GCM 256-bit Key via ECDH Key Agreement
export const deriveSharedKey = async (myPrivateKey, recipientPublicKey) => {
  return await window.crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: recipientPublicKey,
    },
    myPrivateKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false, // non-extractable shared key
    ["encrypt", "decrypt"]
  );
};

// 6. Encrypt Plain Text to AES-GCM Ciphertext + IV
export const encryptText = async (plainText, sharedKey) => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    sharedKey,
    data
  );

  return {
    ciphertextBase64: arrayBufferToBase64(encryptedBuffer),
    ivBase64: arrayBufferToBase64(iv),
  };
};

// 7. Decrypt AES-GCM Ciphertext back to Plain Text
export const decryptText = async (ciphertextBase64, ivBase64, sharedKey) => {
  try {
    const ciphertextBuffer = base64ToArrayBuffer(ciphertextBase64);
    const iv = base64ToArrayBuffer(ivBase64);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      sharedKey,
      ciphertextBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error("E2EE decryption error:", error);
    return "[Encrypted Message - Unable to decrypt]";
  }
};
