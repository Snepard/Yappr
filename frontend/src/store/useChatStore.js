import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import {
  getPrivateKeyLocally,
  importPrivateKeyFromJWK,
  importPublicKeyFromJWK,
  deriveSharedKey,
  encryptText,
  decryptText,
} from "../lib/crypto";

// Cache derived shared keys per user ID in memory
const sharedKeysCache = new Map();

const getSharedKeyForUser = async (otherUser) => {
  if (!otherUser || !otherUser.publicKey) return null;
  const otherUserId = otherUser._id;

  if (sharedKeysCache.has(otherUserId)) {
    return sharedKeysCache.get(otherUserId);
  }

  try {
    const authUser = useAuthStore.getState().authUser;
    if (!authUser) return null;

    const privateKeyJwk = await getPrivateKeyLocally(authUser._id);
    if (!privateKeyJwk) return null;

    const myPrivateKey = await importPrivateKeyFromJWK(privateKeyJwk);
    const recipientPublicKey = await importPublicKeyFromJWK(otherUser.publicKey);

    const sharedKey = await deriveSharedKey(myPrivateKey, recipientPublicKey);
    sharedKeysCache.set(otherUserId, sharedKey);
    return sharedKey;
  } catch (err) {
    console.error("Error deriving shared key:", err);
    return null;
  }
};

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const { selectedUser } = get();
      const res = await axiosInstance.get(`/messages/${userId}`);
      let messagesData = res.data;

      if (selectedUser && selectedUser._id === userId && selectedUser.publicKey) {
        const sharedKey = await getSharedKeyForUser(selectedUser);
        if (sharedKey) {
          messagesData = await Promise.all(
            messagesData.map(async (msg) => {
              if (msg.isEncrypted && msg.iv && msg.text) {
                const plainText = await decryptText(msg.text, msg.iv, sharedKey);
                return { ...msg, text: plainText };
              }
              return msg;
            })
          );
        }
      }

      set({ messages: messagesData });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
  sendMessage: async (messageData) => {
    const { selectedUser, messages, users } = get();
    try {
      let payload = { ...messageData };
      let originalPlainText = messageData.text;

      // Encrypt message text using E2EE if recipient has registered public key
      if (selectedUser?.publicKey && messageData.text) {
        const sharedKey = await getSharedKeyForUser(selectedUser);
        if (sharedKey) {
          const { ciphertextBase64, ivBase64 } = await encryptText(messageData.text, sharedKey);
          payload.text = ciphertextBase64;
          payload.iv = ivBase64;
          payload.isEncrypted = true;
        }
      }

      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, payload);
      
      // For local display, keep the decrypted plain text string
      const localMsg = {
        ...res.data,
        text: originalPlainText,
      };

      set({
        messages: [...messages, localMsg],
        users: users.map((u) =>
          u._id === selectedUser._id ? { ...u, lastMessageTime: res.data.createdAt } : u
        ),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");

    socket.on("newMessage", async (newMessage) => {
      const { selectedUser, users, messages } = get();

      // Update lastMessageTime for the sender user
      set({
        users: users.map((u) =>
          u._id === newMessage.senderId ? { ...u, lastMessageTime: newMessage.createdAt } : u
        ),
      });

      if (selectedUser && newMessage.senderId === selectedUser._id) {
        let msgToAppend = { ...newMessage };

        if (newMessage.isEncrypted && newMessage.iv && newMessage.text && selectedUser.publicKey) {
          const sharedKey = await getSharedKeyForUser(selectedUser);
          if (sharedKey) {
            const plainText = await decryptText(newMessage.text, newMessage.iv, sharedKey);
            msgToAppend.text = plainText;
          }
        }

        set({
          messages: [...messages, msgToAppend],
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));

