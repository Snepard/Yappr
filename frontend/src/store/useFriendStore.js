import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";

export const useFriendStore = create((set, get) => ({
  searchResults: [],
  isSearching: false,
  pendingRequests: [],
  isRequestsLoading: false,
  recommendedUsers: [],
  isRecommendationsLoading: false,

  searchUsers: async (query) => {
    if (!query || !query.trim()) {
      set({ searchResults: [] });
      return;
    }
    set({ isSearching: true });
    try {
      const res = await axiosInstance.get(`/friends/search?query=${encodeURIComponent(query.trim())}`);
      set({ searchResults: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error searching users");
    } finally {
      set({ isSearching: false });
    }
  },

  getRecommendedFriends: async () => {
    set({ isRecommendationsLoading: true });
    try {
      const res = await axiosInstance.get("/friends/recommendations");
      set({ recommendedUsers: res.data });
    } catch (error) {
      console.log("Error loading recommended friends:", error);
    } finally {
      set({ isRecommendationsLoading: false });
    }
  },

  sendFriendRequest: async (targetUserId) => {
    try {
      await axiosInstance.post(`/friends/request/${targetUserId}`);
      toast.success("Friend request sent!");
      // Update local status in search results and recommended users
      set({
        searchResults: get().searchResults.map((u) =>
          u._id === targetUserId ? { ...u, relationshipStatus: "pending_sent" } : u
        ),
        recommendedUsers: get().recommendedUsers.map((u) =>
          u._id === targetUserId ? { ...u, relationshipStatus: "pending_sent" } : u
        ),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send friend request");
    }
  },

  getFriendRequests: async () => {
    set({ isRequestsLoading: true });
    try {
      const res = await axiosInstance.get("/friends/requests");
      set({ pendingRequests: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load friend requests");
    } finally {
      set({ isRequestsLoading: false });
    }
  },

  acceptFriendRequest: async (requestId) => {
    try {
      await axiosInstance.put(`/friends/request/${requestId}/accept`);
      toast.success("Friend request accepted!");
      // Refresh pending requests and chat users list
      get().getFriendRequests();
      useChatStore.getState().getUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
    }
  },

  declineFriendRequest: async (requestId) => {
    try {
      await axiosInstance.put(`/friends/request/${requestId}/decline`);
      toast.success("Friend request declined");
      get().getFriendRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to decline request");
    }
  },

  subscribeToFriendEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newFriendRequest");
    socket.off("friendRequestAccepted");

    socket.on("newFriendRequest", () => {
      toast("You received a new friend request!", { id: "new-friend-request", icon: "👋" });
      get().getFriendRequests();
    });

    socket.on("friendRequestAccepted", ({ acceptedBy }) => {
      toast.success(`${acceptedBy?.fullName || "User"} accepted your friend request!`, { id: `friend-accepted-${acceptedBy?._id || 'user'}` });
      useChatStore.getState().getUsers();
    });
  },

  unsubscribeFromFriendEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newFriendRequest");
      socket.off("friendRequestAccepted");
    }
  },
}));
