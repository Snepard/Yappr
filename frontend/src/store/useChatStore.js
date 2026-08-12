import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useGroupStore } from "./useGroupStore";
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
  isInviteOpen: false,
  isUsersLoading: false,
  isMessagesLoading: false,

  setIsInviteOpen: (isOpen) => {
    if (isOpen) {
      useGroupStore.getState().setSelectedGroup(null);
      useGroupStore.getState().setIsCreatingGroup(false);
    }
    set((state) => ({
      isInviteOpen: isOpen,
      selectedUser: isOpen ? null : state.selectedUser,
    }));
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      console.error("Error in getUsers:", error);
      toast.error(error.response?.data?.message || "Failed to load contacts");
      set({ users: [] });
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

  forwardMessage: async (targetUserId, messageData) => {
    const { users, selectedUser, messages } = get();
    try {
      const targetUser = users.find((u) => u._id === targetUserId);
      let payload = { text: messageData.text || "", image: messageData.image || "" };

      if (targetUser?.publicKey && payload.text) {
        const sharedKey = await getSharedKeyForUser(targetUser);
        if (sharedKey) {
          const { ciphertextBase64, ivBase64 } = await encryptText(payload.text, sharedKey);
          payload.text = ciphertextBase64;
          payload.iv = ivBase64;
          payload.isEncrypted = true;
        }
      }

      const res = await axiosInstance.post(`/messages/send/${targetUserId}`, payload);

      if (selectedUser && selectedUser._id === targetUserId) {
        set({
          messages: [...messages, { ...res.data, text: messageData.text }],
        });
      }
      toast.success(`Message forwarded to ${targetUser?.fullName || "user"}!`);
      return true;
    } catch (error) {
      toast.error("Failed to forward message");
      return false;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId
            ? { ...msg, isDeleted: true, text: "This message was deleted", image: "" }
            : msg
        ),
      }));
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete message");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("messageDeleted");

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

    socket.on("messageDeleted", ({ messageId }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId
            ? { ...msg, isDeleted: true, text: "This message was deleted", image: "" }
            : msg
        ),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("messageDeleted");
    }
  },

  setSelectedUser: (selectedUser) => {
    if (selectedUser) {
      useGroupStore.getState().setSelectedGroup(null);
      useGroupStore.getState().setIsCreatingGroup(false);
    }
    set({ selectedUser, isInviteOpen: false });
  },
}));

