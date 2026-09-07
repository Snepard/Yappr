import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";
import { useGroupStore } from "./useGroupStore";
import {
  generateECDHKeyPair,
  exportKeyToJWK,
  importPublicKeyFromJWK,
  deriveSharedKey,
  encryptText,
  decryptText,
} from "../lib/crypto";
import { showYapInviteToast } from "../components/yap/YapSessionInviteToast";

export const useYapStore = create((set, get) => ({
  isYapLobbyOpen: false,
  activeSession: null,
  messages: [], // Strictly volatile in-memory storage — NEVER persisted to IndexedDB or localStorage
  isCreating: false,
  isJoining: false,
  sessionStartTime: null,

  // Ephemeral cryptography references (Strictly in-memory)
  ephemeralPrivateKey: null,
  ephemeralPublicKeyJwk: null,
  sharedKeys: {}, // { [userId]: CryptoKey }

  openYapLobby: () => {
    // Deselect standard chats and panels
    useChatStore.getState().setSelectedUser(null);
    useChatStore.getState().setIsInviteOpen(false);
    useChatStore.getState().setIsRequestsOpen(false);
    useGroupStore.getState().setSelectedGroup(null);
    useGroupStore.getState().setIsCreatingGroup(false);
    useGroupStore.getState().setIsGroupInfoOpen(false);

    set({ isYapLobbyOpen: true });
  },

  closeYapLobby: () => {
    set({ isYapLobbyOpen: false });
  },

  // Initialize fresh ephemeral ECDH keypair (PFS)
  _initEphemeralKeys: async () => {
    try {
      const keyPair = await generateECDHKeyPair();
      const publicJwk = await exportKeyToJWK(keyPair.publicKey);
      set({
        ephemeralPrivateKey: keyPair.privateKey,
        ephemeralPublicKeyJwk: publicJwk,
        sharedKeys: {},
      });
      return { privateKey: keyPair.privateKey, publicJwk };
    } catch (err) {
      console.error("Failed to generate ephemeral keys:", err);
      throw err;
    }
  },

  // Derive and store pairwise shared key for a peer
  _derivePeerSharedKey: async (peerUserId, peerPublicJwk) => {
    try {
      const { ephemeralPrivateKey, sharedKeys } = get();
      if (!ephemeralPrivateKey || !peerPublicJwk) return;

      const peerPublicKey = await importPublicKeyFromJWK(peerPublicJwk);
      const sharedKey = await deriveSharedKey(ephemeralPrivateKey, peerPublicKey);

      set({
        sharedKeys: {
          ...sharedKeys,
          [peerUserId]: sharedKey,
        },
      });
    } catch (err) {
      console.error("Failed to derive pairwise shared key for peer:", peerUserId, err);
    }
  },

  createSession: async (friendIds = []) => {
    set({ isCreating: true });
    try {
      const { publicJwk } = await get()._initEphemeralKeys();

      const res = await axiosInstance.post("/yap/create", { friendIds });
      const session = res.data;

      set({
        activeSession: session,
        isYapLobbyOpen: false,
        messages: [],
        sessionStartTime: Date.now(),
      });

      // Join socket room and signal ephemeral public key
      const socket = useAuthStore.getState().socket;
      const authUser = useAuthStore.getState().authUser;
      if (socket && socket.connected) {
        socket.emit("joinYapRoom", {
          sessionId: session._id,
          ephemeralPublicKey: publicJwk,
          user: {
            _id: authUser._id,
            fullName: authUser.fullName,
            profilePic: authUser.profilePic,
          },
        });
      }

      get().subscribeToYapSocketEvents();
      toast.success("Chat room created.");
      return session;
    } catch (error) {
      console.error("Error creating Yap session:", error);
      toast.error(error.response?.data?.message || "Failed to create chat room");
      throw error;
    } finally {
      set({ isCreating: false });
    }
  },

  joinSession: async (sessionCode) => {
    if (!sessionCode || !sessionCode.trim()) {
      toast.error("Please enter a valid 6-character room code");
      return;
    }

    set({ isJoining: true });
    try {
      const { publicJwk } = await get()._initEphemeralKeys();

      const res = await axiosInstance.post("/yap/join", {
        sessionCode: sessionCode.trim().toUpperCase(),
      });
      const session = res.data;

      set({
        activeSession: session,
        isYapLobbyOpen: false,
        messages: [],
        sessionStartTime: Date.now(),
      });

      // Deselect standard chats
      useChatStore.getState().setSelectedUser(null);
      useGroupStore.getState().setSelectedGroup(null);

      const socket = useAuthStore.getState().socket;
      const authUser = useAuthStore.getState().authUser;
      if (socket && socket.connected) {
        socket.emit("joinYapRoom", {
          sessionId: session._id,
          ephemeralPublicKey: publicJwk,
          user: {
            _id: authUser._id,
            fullName: authUser.fullName,
            profilePic: authUser.profilePic,
          },
        });
      }

      get().subscribeToYapSocketEvents();
      toast.success("Joined chat room.");
      return session;
    } catch (error) {
      console.error("Error joining Yap session:", error);
      toast.error(error.response?.data?.message || "Invalid or expired room code");
      throw error;
    } finally {
      set({ isJoining: false });
    }
  },

  inviteFriendsToActiveSession: async (friendIds) => {
    const { activeSession } = get();
    if (!activeSession || !friendIds || friendIds.length === 0) return;

    try {
      const res = await axiosInstance.post("/yap/invite", {
        sessionId: activeSession._id,
        friendIds,
      });
      toast.success(res.data.message || "Invites dispatched!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to invite friends");
    }
  },

  sendYapMessage: async (text) => {
    const { activeSession, sharedKeys } = get();
    const authUser = useAuthStore.getState().authUser;
    const socket = useAuthStore.getState().socket;

    if (!activeSession || !text || !text.trim() || !authUser) return;

    const trimmedText = text.trim();
    const messageId = "yap_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();

    try {
      // Encrypt pairwise for each peer connected in the session
      const encryptedFor = {};
      const peerIds = Object.keys(sharedKeys);

      for (const peerId of peerIds) {
        const peerKey = sharedKeys[peerId];
        if (peerKey) {
          const enc = await encryptText(trimmedText, peerKey);
          encryptedFor[peerId] = {
            ciphertextBase64: enc.ciphertextBase64,
            ivBase64: enc.ivBase64,
          };
        }
      }

      // Add plaintext message directly to sender's own volatile in-memory state
      const selfMessage = {
        _id: messageId,
        senderId: authUser._id,
        senderName: authUser.fullName,
        senderPic: authUser.profilePic,
        text: trimmedText,
        timestamp,
        isSelf: true,
      };

      set((state) => ({
        messages: [...state.messages, selfMessage],
      }));

      // Zero-trace broadcast over Socket.IO (No DB persistence)
      if (socket && socket.connected) {
        socket.emit("sendYapMessage", {
          sessionId: activeSession._id,
          messagePayload: {
            _id: messageId,
            sessionId: activeSession._id,
            senderId: authUser._id,
            senderName: authUser.fullName,
            senderPic: authUser.profilePic,
            encryptedFor,
            timestamp,
          },
        });
      }
    } catch (err) {
      console.error("Failed to encrypt and send ephemeral message:", err);
      toast.error("Failed to send message");
    }
  },

  leaveSession: async () => {
    const { activeSession } = get();
    const socket = useAuthStore.getState().socket;

    if (activeSession) {
      try {
        if (socket && socket.connected) {
          socket.emit("leaveYapRoom", { sessionId: activeSession._id });
        }
        await axiosInstance.post("/yap/leave", { sessionId: activeSession._id });
      } catch (err) {
        console.warn("Error leaving session on server:", err);
      }
    }

    get().shredSessionData();
    toast("You left the chat room.");
  },

  endSession: async () => {
    const { activeSession } = get();
    if (!activeSession) return;

    try {
      await axiosInstance.post("/yap/end", { sessionId: activeSession._id });
    } catch (err) {
      console.warn("Error terminating session on server:", err);
    }

    get().shredSessionData();
    toast.success("The chat room was ended.");
  },

  // Permanent shredding of all session data and cryptographic key material
  shredSessionData: () => {
    get().unsubscribeFromYapSocketEvents();

    set({
      activeSession: null,
      messages: [],
      ephemeralPrivateKey: null,
      ephemeralPublicKeyJwk: null,
      sharedKeys: {},
      sessionStartTime: null,
      isYapLobbyOpen: false,
    });
  },

  subscribeToYapSocketEvents: () => {
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    if (!socket) return;

    // Clean up any stale listeners first
    get().unsubscribeFromYapSocketEvents();

    // 1. Peer joined: respond with our public key, and derive shared key for the peer
    socket.on("yapParticipantJoined", async ({ userId, ephemeralPublicKey, user, sessionId }) => {
      const { activeSession, ephemeralPublicKeyJwk } = get();
      if (!activeSession || activeSession._id !== sessionId) return;

      if (userId && userId.toString() !== authUser?._id.toString()) {
        // Derive shared key with the new participant
        if (ephemeralPublicKey) {
          await get()._derivePeerSharedKey(userId, ephemeralPublicKey);
        }

        // Send back our public key specifically to the newly joined peer
        if (ephemeralPublicKeyJwk) {
          socket.emit("yapKeyAnnounce", {
            sessionId,
            targetUserId: userId,
            ephemeralPublicKey: ephemeralPublicKeyJwk,
          });
        }

        // Update active participants list in state
        set((state) => {
          if (!state.activeSession) return state;
          const exists = state.activeSession.activeParticipants.some(
            (p) => (p._id || p).toString() === userId.toString()
          );
          const updatedParticipants = exists
            ? state.activeSession.activeParticipants
            : [...state.activeSession.activeParticipants, user || { _id: userId }];

          return {
            activeSession: {
              ...state.activeSession,
              activeParticipants: updatedParticipants,
            },
          };
        });

        toast(`${user?.fullName || "A participant"} joined the room`);
      }
    });

    // 2. Peer announced their ephemeral public key
    socket.on("yapKeyAnnounce", async ({ sessionId, fromUserId, ephemeralPublicKey }) => {
      const { activeSession } = get();
      if (!activeSession || activeSession._id !== sessionId) return;

      if (fromUserId && fromUserId.toString() !== authUser?._id.toString() && ephemeralPublicKey) {
        await get()._derivePeerSharedKey(fromUserId, ephemeralPublicKey);
      }
    });

    // 3. Incoming encrypted ephemeral message
    socket.on("yapMessage", async (msgPayload) => {
      const { activeSession, sharedKeys } = get();
      if (!activeSession || activeSession._id !== msgPayload.sessionId) return;
      if (msgPayload.senderId?.toString() === authUser?._id.toString()) return;

      const myId = authUser?._id.toString();
      const encryptedTarget = msgPayload.encryptedFor?.[myId];

      if (!encryptedTarget) {
        console.warn("Received Yap message without ciphertext for current user");
        return;
      }

      const senderKey = sharedKeys[msgPayload.senderId];
      if (!senderKey) {
        console.warn("Missing pairwise shared key for sender:", msgPayload.senderId);
        return;
      }

      try {
        const decryptedText = await decryptText(
          encryptedTarget.ciphertextBase64,
          encryptedTarget.ivBase64,
          senderKey
        );

        const incomingMessage = {
          _id: msgPayload._id,
          senderId: msgPayload.senderId,
          senderName: msgPayload.senderName,
          senderPic: msgPayload.senderPic,
          text: decryptedText,
          timestamp: msgPayload.timestamp,
          isSelf: false,
        };

        set((state) => ({
          messages: [...state.messages, incomingMessage],
        }));
      } catch (err) {
        console.error("Failed to decrypt incoming Yap message:", err);
      }
    });

    // 4. Participant left
    socket.on("yapParticipantLeft", ({ userId, sessionId, activeParticipants }) => {
      const { activeSession } = get();
      if (!activeSession || activeSession._id !== sessionId) return;

      set((state) => {
        if (!state.activeSession) return state;
        const remaining = activeParticipants || state.activeSession.activeParticipants.filter(
          (p) => (p._id || p).toString() !== userId.toString()
        );
        return {
          activeSession: {
            ...state.activeSession,
            activeParticipants: remaining,
          },
        };
      });
    });

    // 5. Participant list update broadcast
    socket.on("yapParticipantUpdate", ({ sessionId, activeParticipants }) => {
      const { activeSession } = get();
      if (!activeSession || activeSession._id !== sessionId) return;

      set((state) => {
        if (!state.activeSession) return state;
        return {
          activeSession: {
            ...state.activeSession,
            activeParticipants: activeParticipants || state.activeSession.activeParticipants,
          },
        };
      });
    });

    // 6. Session ended
    socket.on("yapSessionEnded", ({ sessionId, reason }) => {
      const { activeSession } = get();
      if (activeSession && activeSession._id === sessionId) {
        get().shredSessionData();
        toast(`Chat room ended: ${reason || "Room closed"}.`);
      }
    });
  },

  unsubscribeFromYapSocketEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("yapParticipantJoined");
    socket.off("yapKeyAnnounce");
    socket.off("yapMessage");
    socket.off("yapParticipantLeft");
    socket.off("yapParticipantUpdate");
    socket.off("yapSessionEnded");
  },

  // Global invite listener (always active when logged in)
  subscribeToGlobalInvites: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("yapSessionInvite"); // Prevent duplicate listeners

    socket.on("yapSessionInvite", (inviteData) => {
      showYapInviteToast({
        sessionId: inviteData.sessionId,
        sessionCode: inviteData.sessionCode,
        inviterName: inviteData.inviterName,
        inviterProfilePic: inviteData.inviterProfilePic,
        onAccept: (code) => {
          get().joinSession(code);
        },
      });
    });
  },

  unsubscribeFromGlobalInvites: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("yapSessionInvite");
  },
}));
