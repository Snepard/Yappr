import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";

export const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  isGroupsLoading: false,
  isGroupDetailsLoading: false,
  isGroupMessagesLoading: false,
  isGroupInfoOpen: false,
  isCreatingGroup: false,
  activeTimeout: { isTimedOut: false, until: null },

  setIsCreatingGroup: (isCreating) => {
    if (isCreating) {
      useChatStore.getState().setSelectedUser(null);
      useChatStore.getState().setIsInviteOpen(false);
    }
    set({
      isCreatingGroup: isCreating,
      isGroupInfoOpen: false,
      selectedGroup: isCreating ? null : get().selectedGroup,
    });
  },
  setIsGroupInfoOpen: (isOpen) => {
    if (isOpen) {
      useChatStore.getState().setSelectedUser(null);
      useChatStore.getState().setIsInviteOpen(false);
      set({ isCreatingGroup: false });
    }
    set({ isGroupInfoOpen: isOpen });
  },

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  getGroupDetails: async (groupId) => {
    if (!groupId) return;
    set({ isGroupDetailsLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}`);
      const { group, userTimeout } = res.data;

      set((state) => ({
        selectedGroup: group,
        activeTimeout: userTimeout || { isTimedOut: false, until: null },
        groups: state.groups.map((g) => (g._id === group._id ? { ...g, ...group } : g)),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load group details");
    } finally {
      set({ isGroupDetailsLoading: false });
    }
  },

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups", groupData);
      const newGroup = res.data;
      set((state) => {
        const exists = state.groups.some(
          (g) => (g._id || g).toString() === (newGroup._id || newGroup).toString()
        );
        if (exists) {
          return {
            selectedGroup: newGroup,
            isCreatingGroup: false,
            isCreateModalOpen: false,
          };
        }
        return {
          groups: [newGroup, ...state.groups],
          selectedGroup: newGroup,
          isCreatingGroup: false,
          isCreateModalOpen: false,
        };
      });
      toast.success(`Group "${res.data.name}" created successfully!`);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
      return null;
    }
  },

  updateGroupInfo: async (groupId, updateData) => {
    try {
      const res = await axiosInstance.put(`/groups/${groupId}/info`, updateData);
      set((state) => ({
        selectedGroup: state.selectedGroup?._id === groupId ? res.data : state.selectedGroup,
        groups: state.groups.map((g) => (g._id === groupId ? { ...g, ...res.data } : g)),
      }));
      toast.success("Group info updated!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update group info");
      return null;
    }
  },

  updateGroupPermissions: async (groupId, permissions) => {
    try {
      const res = await axiosInstance.put(`/groups/${groupId}/permissions`, { permissions });
      set((state) => ({
        selectedGroup: state.selectedGroup?._id === groupId ? res.data : state.selectedGroup,
        groups: state.groups.map((g) => (g._id === groupId ? { ...g, ...res.data } : g)),
      }));
      toast.success("Group permissions updated!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update permissions");
      return null;
    }
  },

  addMembers: async (groupId, memberIds) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/members`, { memberIds });
      set((state) => ({
        selectedGroup: state.selectedGroup?._id === groupId ? res.data : state.selectedGroup,
        groups: state.groups.map((g) => (g._id === groupId ? { ...g, ...res.data } : g)),
      }));
      toast.success("Members added to group!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add members");
      return null;
    }
  },

  removeMember: async (groupId, userId) => {
    try {
      const res = await axiosInstance.delete(`/groups/${groupId}/members/${userId}`);
      set((state) => ({
        selectedGroup: state.selectedGroup?._id === groupId ? res.data : state.selectedGroup,
        groups: state.groups.map((g) => (g._id === groupId ? { ...g, ...res.data } : g)),
      }));
      toast.success("Member removed from group");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to remove member");
      return null;
    }
  },

  toggleAdminRole: async (groupId, userId, isAdmin) => {
    try {
      const res = await axiosInstance.put(`/groups/${groupId}/admins/${userId}`, { isAdmin });
      set((state) => ({
        selectedGroup: state.selectedGroup?._id === groupId ? res.data : state.selectedGroup,
        groups: state.groups.map((g) => (g._id === groupId ? { ...g, ...res.data } : g)),
      }));
      toast.success(isAdmin ? "Promoted to Admin!" : "Demoted to Member");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to update admin role");
      return null;
    }
  },

  timeoutMember: async (groupId, userId, durationMinutes) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/timeout/${userId}`, { durationMinutes });
      const updatedGroup = res.data?.group || res.data;
      set((state) => ({
        selectedGroup: state.selectedGroup?._id === groupId ? updatedGroup : state.selectedGroup,
        groups: state.groups.map((g) => (g._id === groupId ? { ...g, ...updatedGroup } : g)),
      }));
      toast.success(`Member timed out for ${durationMinutes} minute(s)`);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to give timeout");
      return null;
    }
  },

  removeTimeout: async (groupId, userId) => {
    try {
      const res = await axiosInstance.delete(`/groups/${groupId}/timeout/${userId}`);
      const updatedGroup = res.data?.group || res.data;
      set((state) => ({
        selectedGroup: state.selectedGroup?._id === groupId ? updatedGroup : state.selectedGroup,
        groups: state.groups.map((g) => (g._id === groupId ? { ...g, ...updatedGroup } : g)),
      }));
      toast.success("Timeout removed early");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to remove timeout");
      return null;
    }
  },

  getGroupMessages: async (groupId) => {
    if (!groupId) return;
    set({ isGroupMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/group/${groupId}`);
      set({ groupMessages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load group messages");
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  sendGroupMessage: async (groupId, messageData) => {
    try {
      const res = await axiosInstance.post(`/messages/send/group/${groupId}`, messageData);
      set((state) => ({
        groupMessages: [...state.groupMessages, res.data],
      }));
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send group message");
      throw error;
    }
  },

  leaveGroup: async (groupId) => {
    try {
      await axiosInstance.post(`/groups/${groupId}/leave`);
      set((state) => ({
        groups: state.groups.filter((g) => g._id !== groupId),
        selectedGroup: state.selectedGroup?._id === groupId ? null : state.selectedGroup,
        isGroupInfoOpen: false,
        groupMessages: state.selectedGroup?._id === groupId ? [] : state.groupMessages,
      }));
      toast.success("Left group successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave group");
    }
  },

  setSelectedGroup: (group) => {
    const socket = useAuthStore.getState().socket;
    const currentSelected = get().selectedGroup;

    if (socket && currentSelected) {
      socket.emit("leaveGroupRoom", currentSelected._id);
    }

    if (group) {
      useChatStore.getState().setSelectedUser(null);
      useChatStore.getState().setIsInviteOpen(false);
    }

    set({ selectedGroup: group, isCreatingGroup: false, isGroupInfoOpen: false, groupMessages: [] });

    if (group) {
      if (socket) {
        socket.emit("joinGroupRoom", group._id);
      }
      get().getGroupDetails(group._id);
      get().getGroupMessages(group._id);
    }
  },

  subscribeToGroupEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("groupCreated");
    socket.off("groupUpdated");
    socket.off("groupMemberTimeout");
    socket.off("groupMemberRemoved");
    socket.off("newGroupMessage");
    socket.off("messageDeleted");

    socket.on("groupCreated", (newGroup) => {
      if (!newGroup || !newGroup._id) return;
      set((state) => {
        const exists = state.groups.some(
          (g) => (g._id || g).toString() === (newGroup._id || newGroup).toString()
        );
        if (exists) return state;
        return { groups: [newGroup, ...state.groups] };
      });
    });

    socket.on("groupUpdated", (updatedGroup) => {
      set((state) => {
        const authUser = useAuthStore.getState().authUser;
        const myId = authUser?._id;
        
        let newTimeout = state.activeTimeout;
        if (myId && updatedGroup.timeouts) {
          const now = new Date();
          const foundTimeout = updatedGroup.timeouts.find(
            (t) => (t.userId._id || t.userId).toString() === myId.toString() && new Date(t.until) > now
          );
          newTimeout = {
            isTimedOut: Boolean(foundTimeout),
            until: foundTimeout ? foundTimeout.until : null,
          };
        }

        return {
          groups: state.groups.map((g) => (g._id === updatedGroup._id ? { ...g, ...updatedGroup } : g)),
          selectedGroup: state.selectedGroup?._id === updatedGroup._id ? updatedGroup : state.selectedGroup,
          activeTimeout: state.selectedGroup?._id === updatedGroup._id ? newTimeout : state.activeTimeout,
        };
      });
    });

    socket.on("groupMemberTimeout", ({ groupId, userId, until }) => {
      const authUser = useAuthStore.getState().authUser;
      const { selectedGroup } = get();

      if (authUser && userId.toString() === authUser._id.toString() && selectedGroup?._id === groupId) {
        const isTimedOut = Boolean(until && new Date(until) > new Date());
        set({
          activeTimeout: {
            isTimedOut,
            until: isTimedOut ? until : null,
          },
        });

        if (isTimedOut) {
          toast.error("An admin placed you on timeout in this group chat!");
        } else {
          toast.success("Your timeout in this group has expired / was removed!");
        }
      }
    });

    socket.on("groupMemberRemoved", ({ groupId, userId }) => {
      const authUser = useAuthStore.getState().authUser;
      if (authUser && userId.toString() === authUser._id.toString()) {
        set((state) => ({
          groups: state.groups.filter((g) => g._id !== groupId),
          selectedGroup: state.selectedGroup?._id === groupId ? null : state.selectedGroup,
          groupMessages: state.selectedGroup?._id === groupId ? [] : state.groupMessages,
        }));
        toast("You were removed from the group");
      }
    });

    socket.on("newGroupMessage", (msg) => {
      const { selectedGroup } = get();
      if (selectedGroup && msg.groupId?.toString() === selectedGroup._id.toString()) {
        set((state) => {
          // Avoid duplicate messages if already appended locally
          if (state.groupMessages.some((m) => m._id === msg._id)) return state;
          return { groupMessages: [...state.groupMessages, msg] };
        });
      }
    });

    socket.on("messageDeleted", ({ messageId, groupId }) => {
      const { selectedGroup } = get();
      if (selectedGroup && groupId?.toString() === selectedGroup._id.toString()) {
        set((state) => ({
          groupMessages: state.groupMessages.map((msg) =>
            msg._id === messageId
              ? { ...msg, isDeleted: true, text: "This message was deleted", image: "" }
              : msg
          ),
        }));
      }
    });
  },

  unsubscribeFromGroupEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("groupCreated");
      socket.off("groupUpdated");
      socket.off("groupMemberTimeout");
      socket.off("groupMemberRemoved");
      socket.off("newGroupMessage");
      socket.off("messageDeleted");
    }
  },
}));
