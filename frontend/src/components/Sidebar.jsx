import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { useGroupStore } from "../store/useGroupStore";
import { confirmLogout } from "../lib/confirmToast";

import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarNavTabs from "./sidebar/SidebarNavTabs";
import SidebarSearch from "./sidebar/SidebarSearch";
import SidebarUserItem from "./sidebar/SidebarUserItem";
import SidebarGroupItem from "./sidebar/SidebarGroupItem";
import FindFriendsTab from "./sidebar/FindFriendsTab";
import RequestsTab from "./sidebar/RequestsTab";
import MiniSidebarRail from "./sidebar/MiniSidebarRail";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, setIsInviteOpen } = useChatStore();
  const { onlineUsers, authUser, logout } = useAuthStore();
  const {
    groups,
    getGroups,
    selectedGroup,
    setSelectedGroup,
    setIsCreatingGroup,
    subscribeToGroupEvents,
    unsubscribeFromGroupEvents,
  } = useGroupStore();

  const {
    searchResults,
    isSearching,
    pendingRequests,
    isRequestsLoading,
    recommendedUsers,
    isRecommendationsLoading,
    searchUsers,
    getRecommendedFriends,
    sendFriendRequest,
    getFriendRequests,
    acceptFriendRequest,
    declineFriendRequest,
    subscribeToFriendEvents,
    unsubscribeFromFriendEvents,
  } = useFriendStore();

  const [activeTab, setActiveTab] = useState("chats"); // "chats" | "groups" | "find" | "requests"
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    getUsers();
    getGroups();
    getFriendRequests();
    getRecommendedFriends();
    subscribeToFriendEvents();
    subscribeToGroupEvents();
    return () => {
      unsubscribeFromFriendEvents();
      unsubscribeFromGroupEvents();
    };
  }, [
    getUsers,
    getGroups,
    getFriendRequests,
    getRecommendedFriends,
    subscribeToFriendEvents,
    subscribeToGroupEvents,
    unsubscribeFromFriendEvents,
    unsubscribeFromGroupEvents,
  ]);

  // Search debouncer for "find" tab
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "find" && friendSearchQuery.trim()) {
        searchUsers(friendSearchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [friendSearchQuery, activeTab, searchUsers]);

  const handleLogout = useCallback(async () => {
    const confirmed = await confirmLogout();
    if (confirmed) {
      logout();
      setShowProfileDropdown(false);
    }
  }, [logout]);

  const handleSelectUser = useCallback((user) => {
    setSelectedGroup(null);
    setSelectedUser(user);
  }, [setSelectedGroup, setSelectedUser]);

  const handleSelectGroup = useCallback((group) => {
    setSelectedUser(null);
    setSelectedGroup(group);
  }, [setSelectedUser, setSelectedGroup]);

  // Filtered and sorted users for DM chats tab
  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const matchesSearch =
          user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesOnlineFilter = showOnlineOnly ? onlineUsers.includes(user._id) : true;
        return matchesSearch && matchesOnlineFilter;
      })
      .sort((a, b) => {
        const aTime = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
        const bTime = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;

        if (aTime && bTime) return bTime - aTime;
        if (aTime && !bTime) return -1;
        if (!aTime && bTime) return 1;

        const aOnline = onlineUsers.includes(a._id);
        const bOnline = onlineUsers.includes(b._id);

        if (aOnline !== bOnline) return bOnline - aOnline;
        return (a.fullName || "").localeCompare(b.fullName || "");
      });
  }, [users, searchQuery, showOnlineOnly, onlineUsers]);

  // Filtered groups for groups tab
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const query = searchQuery.toLowerCase();
    return groups.filter(
      (g) => g.name?.toLowerCase().includes(query) || g.description?.toLowerCase().includes(query)
    );
  }, [groups, searchQuery]);

  if (isCollapsed) {
    return (
      <MiniSidebarRail
        authUser={authUser}
        showProfileDropdown={showProfileDropdown}
        setShowProfileDropdown={setShowProfileDropdown}
        onOpenInvite={() => setIsInviteOpen(true)}
        onLogout={handleLogout}
        onExpand={() => setIsCollapsed(false)}
        groups={groups}
        users={filteredUsers}
        onlineUsers={onlineUsers}
        selectedGroup={selectedGroup}
        selectedUser={selectedUser}
        onSelectGroup={handleSelectGroup}
        onSelectUser={handleSelectUser}
      />
    );
  }

  return (
    <aside className="h-full w-full md:w-80 transition-all duration-300 border-r border-sky-200/60 flex flex-col bg-white/90 backdrop-blur-xl select-none">
      {/* Header */}
      <SidebarHeader
        authUser={authUser}
        showProfileDropdown={showProfileDropdown}
        setShowProfileDropdown={setShowProfileDropdown}
        onOpenInvite={() => setIsInviteOpen(true)}
        onLogout={handleLogout}
        onCollapse={() => setIsCollapsed(true)}
      />

      {/* Tabs */}
      <SidebarNavTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingRequestsCount={pendingRequests.length}
        onCreateGroup={() => setIsCreatingGroup(true)}
      />

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === "chats" && (
          <div className="space-y-1">
            <SidebarSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showOnlineOnly={showOnlineOnly}
              setShowOnlineOnly={setShowOnlineOnly}
              placeholder="Search conversations..."
            />
            {isUsersLoading ? (
              <SidebarSkeleton />
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500 font-medium">No contacts found</div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredUsers.map((user) => (
                  <SidebarUserItem
                    key={user._id}
                    user={user}
                    isSelected={selectedUser?._id === user._id}
                    isOnline={onlineUsers.includes(user._id)}
                    onSelect={handleSelectUser}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "groups" && (
          <div className="space-y-1">
            <SidebarSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              placeholder="Search groups..."
            />
            {filteredGroups.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500 font-medium">No groups found</div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredGroups.map((group) => (
                  <SidebarGroupItem
                    key={group._id}
                    group={group}
                    isSelected={selectedGroup?._id === group._id}
                    onSelect={handleSelectGroup}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "find" && (
          <FindFriendsTab
            friendSearchQuery={friendSearchQuery}
            setFriendSearchQuery={setFriendSearchQuery}
            recommendedUsers={recommendedUsers}
            isRecommendationsLoading={isRecommendationsLoading}
            searchResults={searchResults}
            isSearching={isSearching}
            sendFriendRequest={sendFriendRequest}
            onOpenInvite={() => setIsInviteOpen(true)}
          />
        )}

        {activeTab === "requests" && (
          <RequestsTab
            pendingRequests={pendingRequests}
            isRequestsLoading={isRequestsLoading}
            acceptFriendRequest={acceptFriendRequest}
            declineFriendRequest={declineFriendRequest}
          />
        )}
      </div>
    </aside>
  );
};

export default Sidebar;