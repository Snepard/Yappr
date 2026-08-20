import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import {
  generateECDHKeyPair,
  exportKeyToJWK,
  storePrivateKeyLocally,
  getPrivateKeyLocally,
  encryptPrivateKeyWithSecret,
  decryptPrivateKeyWithSecret,
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
    isChangingPassword: false,
    isPinRecoveryModalOpen: false,
    isPinSetupModalOpen: false,
    isRestoringKeys: false,
    pinError: null,

    setPinRecoveryModalOpen: (isOpen) => set({ isPinRecoveryModalOpen: isOpen }),
    setPinSetupModalOpen: (isOpen) => set({ isPinSetupModalOpen: isOpen }),
    
    initializeE2EEKeys: async (user, password = null, pin = null) => {
        if (!user || !user._id) return;
        try {
            let localPrivateKeyJwk = await getPrivateKeyLocally(user._id);

            // 1. If key is in IndexedDB
            if (localPrivateKeyJwk) {
                // If public key is not on server or backups are missing and credentials available
                const needsServerUpdate = !user.publicKey || (!user.encryptedPrivateKey && password) || (!user.pinEncryptedPrivateKey && pin);
                if (needsServerUpdate) {
                    const payload = {};
                    if (!user.publicKey) {
                        // Export public key if missing
                        // We can generate keypair or if only private key is in IndexedDB, derive or re-export
                    }
                    if (!user.encryptedPrivateKey && password) {
                        const pwEnc = await encryptPrivateKeyWithSecret(localPrivateKeyJwk, password);
                        payload.encryptedPrivateKey = pwEnc.ciphertextBase64;
                        payload.keySalt = pwEnc.salt;
                        payload.keyIv = pwEnc.ivBase64;
                    }
                    if (!user.pinEncryptedPrivateKey && pin) {
                        const pinEnc = await encryptPrivateKeyWithSecret(localPrivateKeyJwk, pin);
                        payload.pinEncryptedPrivateKey = pinEnc.ciphertextBase64;
                        payload.pinSalt = pinEnc.salt;
                        payload.pinIv = pinEnc.ivBase64;
                    }
                    if (Object.keys(payload).length > 0) {
                        const res = await axiosInstance.put("/auth/e2ee-keys", payload);
                        set({ authUser: res.data });
                    }
                }

                // If user doesn't have a PIN backup on server yet, suggest PIN setup
                if (!user.pinEncryptedPrivateKey) {
                    set({ isPinSetupModalOpen: true });
                }
                return;
            }

            // 2. Key NOT in IndexedDB — Attempt to restore from password backup
            if (user.encryptedPrivateKey && password) {
                try {
                    const decryptedJwk = await decryptPrivateKeyWithSecret(
                        user.encryptedPrivateKey,
                        user.keySalt,
                        user.keyIv,
                        password
                    );
                    await storePrivateKeyLocally(user._id, decryptedJwk);

                    if (!user.pinEncryptedPrivateKey) {
                        set({ isPinSetupModalOpen: true });
                    }
                    return;
                } catch (decErr) {
                    console.warn("Could not decrypt private key with entered password:", decErr);
                }
            }

            // 3. Key NOT in IndexedDB & Password Decryption failed/unavailable — Check if PIN backup exists
            if (user.pinEncryptedPrivateKey) {
                set({ isPinRecoveryModalOpen: true });
                return;
            }

            // 4. No local key & No server backups — First time setup / legacy migration
            const keyPair = await generateECDHKeyPair();
            const privateJwk = await exportKeyToJWK(keyPair.privateKey);
            const publicJwk = await exportKeyToJWK(keyPair.publicKey);

            await storePrivateKeyLocally(user._id, privateJwk);

            const payload = { publicKey: publicJwk };
            if (password) {
                const pwEnc = await encryptPrivateKeyWithSecret(privateJwk, password);
                payload.encryptedPrivateKey = pwEnc.ciphertextBase64;
                payload.keySalt = pwEnc.salt;
                payload.keyIv = pwEnc.ivBase64;
            }
            if (pin) {
                const pinEnc = await encryptPrivateKeyWithSecret(privateJwk, pin);
                payload.pinEncryptedPrivateKey = pinEnc.ciphertextBase64;
                payload.pinSalt = pinEnc.salt;
                payload.pinIv = pinEnc.ivBase64;
            }

            const res = await axiosInstance.put("/auth/e2ee-keys", payload);
            set({ authUser: res.data });

            if (!pin && !user.pinEncryptedPrivateKey) {
                set({ isPinSetupModalOpen: true });
            }
        } catch (err) {
            console.error("Failed to initialize E2EE keys:", err);
        }
    },

    recoverKeyWithPin: async (pin, currentPassword = null) => {
        set({ isRestoringKeys: true, pinError: null });
        try {
            const user = get().authUser;
            if (!user || !user.pinEncryptedPrivateKey) {
                throw new Error("No PIN backup available for this account.");
            }

            const recoveredPrivateKey = await decryptPrivateKeyWithSecret(
                user.pinEncryptedPrivateKey,
                user.pinSalt,
                user.pinIv,
                pin
            );

            await storePrivateKeyLocally(user._id, recoveredPrivateKey);

            // If user has a current session password or provided one, restore password envelope
            if (currentPassword) {
                const pwEnc = await encryptPrivateKeyWithSecret(recoveredPrivateKey, currentPassword);
                const res = await axiosInstance.put("/auth/e2ee-keys", {
                    encryptedPrivateKey: pwEnc.ciphertextBase64,
                    keySalt: pwEnc.salt,
                    keyIv: pwEnc.ivBase64,
                });
                set({ authUser: res.data });
            }

            // Report successful PIN attempt
            try {
                await axiosInstance.post("/auth/pin-attempt", { success: true });
            } catch (ignore) {}

            set({ isPinRecoveryModalOpen: false, isRestoringKeys: false });
            toast.success("E2EE Encryption Key restored! All past messages unlocked.");
            return true;
        } catch (error) {
            console.error("PIN recovery error:", error);
            try {
                await axiosInstance.post("/auth/pin-attempt", { success: false });
            } catch (ignore) {}

            const errorMsg = error.message === "Invalid secret or corrupted key backup"
                ? "Incorrect 6-digit PIN. Please try again."
                : error.response?.data?.message || "Failed to recover encryption keys.";

            set({ isRestoringKeys: false, pinError: errorMsg });
            toast.error(errorMsg);
            return false;
        }
    },

    setupPinBackup: async (pin) => {
        set({ isRestoringKeys: true });
        try {
            const user = get().authUser;
            if (!user) throw new Error("User not authenticated");

            let privateKeyJwk = await getPrivateKeyLocally(user._id);
            if (!privateKeyJwk) {
                throw new Error("Local private key not found to create backup");
            }

            const pinEnc = await encryptPrivateKeyWithSecret(privateKeyJwk, pin);
            const res = await axiosInstance.put("/auth/e2ee-keys", {
                pinEncryptedPrivateKey: pinEnc.ciphertextBase64,
                pinSalt: pinEnc.salt,
                pinIv: pinEnc.ivBase64,
            });

            set({ authUser: res.data, isPinSetupModalOpen: false, isRestoringKeys: false });
            toast.success("6-Digit E2EE Backup PIN configured successfully!");
            return true;
        } catch (error) {
            console.error("Error setting up PIN backup:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to set up PIN backup");
            set({ isRestoringKeys: false });
            return false;
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
        set({ isSigningUp: true});
        try {
            // Generate ECDH P-256 Keypair locally before account registration
            const keyPair = await generateECDHKeyPair();
            const privateJwk = await exportKeyToJWK(keyPair.privateKey);
            const publicJwk = await exportKeyToJWK(keyPair.publicKey);

            // Envelope encrypt private key with password
            const pwEnc = await encryptPrivateKeyWithSecret(privateJwk, data.password);

            // Envelope encrypt private key with 6-digit PIN if provided
            let pinEnc = null;
            if (data.pin && data.pin.length === 6) {
                pinEnc = await encryptPrivateKeyWithSecret(privateJwk, data.pin);
            }

            // Register user
            const res = await axiosInstance.post("/auth/signup", {
                fullName: data.fullName,
                username: data.username,
                email: data.email,
                password: data.password,
            });

            const newUser = res.data;

            // Persist private key in IndexedDB
            await storePrivateKeyLocally(newUser._id, privateJwk);

            // Upload public key and encrypted backup envelopes
            const keyPayload = {
                publicKey: publicJwk,
                encryptedPrivateKey: pwEnc.ciphertextBase64,
                keySalt: pwEnc.salt,
                keyIv: pwEnc.ivBase64,
            };

            if (pinEnc) {
                keyPayload.pinEncryptedPrivateKey = pinEnc.ciphertextBase64;
                keyPayload.pinSalt = pinEnc.salt;
                keyPayload.pinIv = pinEnc.ivBase64;
            }

            const updatedUserRes = await axiosInstance.put("/auth/e2ee-keys", keyPayload);
            set({ authUser: updatedUserRes.data });

            toast.success("Account created successfully with E2EE!");
            get().connectSocket();
        } catch (error) {
            console.error("Signup error:", error);
            toast.error(error.response?.data?.message || "Signup failed");
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
            await get().initializeE2EEKeys(res.data, data.password);
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null, isPinRecoveryModalOpen: false, isPinSetupModalOpen: false });
            toast.success("Logged out successfully!!");
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");
        }
    },

    updateProfile: async(data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set ({ authUser: res.data.updatedUser || res.data });
            toast.success("Profile Updated Successfully!!");
        } catch (error) {
            console.log("error in updateProfile");
            toast.error(error.response?.data?.message || "Failed to update profile");
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

    changePassword: async (currentPassword, newPassword) => {
        set({ isChangingPassword: true });
        try {
            const user = get().authUser;
            let privateKeyJwk = user ? await getPrivateKeyLocally(user._id) : null;

            // If private key is not in IndexedDB, attempt decrypting from existing backup
            if (!privateKeyJwk && user?.encryptedPrivateKey) {
                try {
                    privateKeyJwk = await decryptPrivateKeyWithSecret(
                        user.encryptedPrivateKey,
                        user.keySalt,
                        user.keyIv,
                        currentPassword
                    );
                    if (privateKeyJwk) {
                        await storePrivateKeyLocally(user._id, privateKeyJwk);
                    }
                } catch (e) {
                    console.warn("Could not decrypt existing key during password change:", e);
                }
            }

            const payload = { currentPassword, newPassword };

            // Re-encrypt SAME private key with the new password
            if (privateKeyJwk) {
                const newPwEnc = await encryptPrivateKeyWithSecret(privateKeyJwk, newPassword);
                payload.encryptedPrivateKey = newPwEnc.ciphertextBase64;
                payload.keySalt = newPwEnc.salt;
                payload.keyIv = newPwEnc.ivBase64;
            }

            const res = await axiosInstance.put("/auth/change-password", payload);
            if (res.data.user) {
                set({ authUser: res.data.user });
            }
            toast.success(res.data.message || "Password updated successfully!");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update password");
            return false;
        } finally {
            set({ isChangingPassword: false });
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