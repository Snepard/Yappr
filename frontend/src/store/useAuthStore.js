import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import {
  generateECDHKeyPair,
  exportKeyToJWK,
  storePrivateKeyLocally,
  getPrivateKeyLocally,
} from "../lib/crypto";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001": "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    onlineUsers: [],
    socket: null,
    isCheckingAuth: true,
    isSendingReset: false,
    isResettingPassword: false,
    
    initializeE2EEKeys: async (user) => {
        if (!user || !user._id) return;
        try {
            const localPrivateKeyJwk = await getPrivateKeyLocally(user._id);
            if (!localPrivateKeyJwk || !user.publicKey) {
                // Generate new keypair for user
                const keyPair = await generateECDHKeyPair();
                const privateJwk = await exportKeyToJWK(keyPair.privateKey);
                const publicJwk = await exportKeyToJWK(keyPair.publicKey);

                await storePrivateKeyLocally(user._id, privateJwk);
                const res = await axiosInstance.put("/auth/public-key", { publicKey: publicJwk });
                set({ authUser: res.data });
            }
        } catch (err) {
            console.error("Failed to initialize E2EE keys:", err);
        }
    },

    checkAuth: async() => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({authUser:res.data});
            get().connectSocket();
            get().initializeE2EEKeys(res.data);
        } catch (error) {
            console.log("Error in checkAuth: ", error);
            set({authUser:null});
        } finally {
            set({ isCheckingAuth: false});
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true})
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created successfully!!");
            get().connectSocket();
            get().initializeE2EEKeys(res.data);
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set ({ isSigningUp: false });
        }
    },
    
    login: async(data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Logged in successfully");
            get().connectSocket();
            get().initializeE2EEKeys(res.data);
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully!!");
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    updateProfile: async(data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set ({ authUser: res.data });
            toast.success("Profile Updated Successfully!!");
        } catch (error) {
            console.log("error in updateProfile");
            toast.error(error.response.data.message);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    forgotPassword: async (email) => {
        set({ isSendingReset: true });
        try {
            const res = await axiosInstance.post("/auth/forgot-password", { email });
            toast.success(res.data.message || "Reset link sent!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong.");
        } finally {
            set({ isSendingReset: false });
        }
    },

    resetPassword: async (token, password) => {
        set({ isResettingPassword: true });
        try {
            const res = await axiosInstance.put(`/auth/reset-password/${token}`, { password });
            toast.success(res.data.message || "Password reset successfully!");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong.");
            return false;
        } finally {
            set({ isResettingPassword: false });
        }
    },

    connectSocket: () => {
        const {authUser} = get();
        if(!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            withCredentials: true,
            query: {
                userId: authUser._id,
            }
        });

        set({ socket: socket });

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket?.connected) {
            socket.disconnect();
            console.log("Socket disconnected manually");
        }
        set({ socket: null });
    },
}));