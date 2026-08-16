import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { useGroupStore } from "../store/useGroupStore";
import { useThemeStore } from "../store/useThemeStore";
import { confirmLogout } from "../lib/confirmToast";

import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarNavTabs from "./sidebar/SidebarNavTabs";
import SidebarSearch from "./sidebar/SidebarSearch";
import SidebarUserItem from "./sidebar/SidebarUserItem";
import SidebarGroupItem from "./sidebar/SidebarGroupItem";
import FindFriendsTab from "./sidebar/FindFriendsTab";
import MiniSidebarRail from "./sidebar/MiniSidebarRail";

const MIN_SIDEBAR_WIDTH = 320;

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";
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

  const [activeTab, setActiveTab] = useState("chats"); // "chats" | "groups" | "discover"
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("yappr_sidebar_width");
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= MIN_SIDEBAR_WIDTH) return parsed;
    }
    return MIN_SIDEBAR_WIDTH;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxAllowedWidth = useMemo(() => {
    return Math.max(MIN_SIDEBAR_WIDTH, Math.floor(windowWidth * 0.30));
  }, [windowWidth]);

  useEffect(() => {
    if (sidebarWidth > maxAllowedWidth) {
      setSidebarWidth(maxAllowedWidth);
    }
  }, [maxAllowedWidth, sidebarWidth]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDoubleClick = useCallback(() => {
    setSidebarWidth(MIN_SIDEBAR_WIDTH);
    localStorage.setItem("yappr_sidebar_width", MIN_SIDEBAR_WIDTH.toString());
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const currentX = e.touches ? e.touches[0].clientX : e.clientX;
      const maxW = Math.max(MIN_SIDEBAR_WIDTH, Math.floor(window.innerWidth * 0.30));
      const clampedW = Math.min(maxW, Math.max(MIN_SIDEBAR_WIDTH, currentX));

      setSidebarWidth(clampedW);
      localStorage.setItem("yappr_sidebar_width", clampedW.toString());
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleMouseMove);
    window.addEventListener("touchend", handleMouseUp);

    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging]);

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

  // Search debouncer for "discover" tab
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "discover" && friendSearchQuery.trim()) {
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
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        groups={filteredGroups}
        users={filteredUsers}
        onlineUsers={onlineUsers}
        selectedGroup={selectedGroup}
        selectedUser={selectedUser}
        onSelectGroup={handleSelectGroup}
        onSelectUser={handleSelectUser}
        pendingRequests={pendingRequests}
        onCreateGroup={() => setIsCreatingGroup(true)}
        recommendedUsers={recommendedUsers}
        sendFriendRequest={sendFriendRequest}
        acceptFriendRequest={acceptFriendRequest}
        declineFriendRequest={declineFriendRequest}
      />
    );
  }

  return (
    <aside
      className={`h-full w-full relative flex flex-col select-none overflow-hidden ${
        isNeubrutalism
          ? "bg-[#FFFDF0] border-r-3 border-black text-black rounded-none"
          : "border-r border-sky-200/60 bg-white/90 backdrop-blur-xl rounded-none md:rounded-l-[2rem] md:rounded-r-none"
      } ${
        isDragging ? "transition-none" : "transition-all duration-300"
      }`}
      style={{
        width: windowWidth >= 768 ? `${sidebarWidth}px` : undefined,
      }}
    >
      {/* Resizer Handle */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        className="absolute top-0 bottom-0 -right-1.5 w-3 cursor-col-resize z-50 group flex items-center justify-center select-none touch-none"
        title="Drag to resize sidebar (Double-click to reset width)"
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={sidebarWidth}
        aria-valuemin={MIN_SIDEBAR_WIDTH}
        aria-valuemax={maxAllowedWidth}
      >
        <div
          className={`w-1 h-12 transition-all duration-150 ${
            isNeubrutalism
              ? isDragging
                ? "bg-black shadow-[2px_2px_0_#000] scale-y-125 opacity-100 rounded-none"
                : "bg-black/60 group-hover:bg-black group-hover:scale-y-110 opacity-0 group-hover:opacity-100 rounded-none"
              : isDragging
                ? "bg-blue-500 shadow-md shadow-blue-500/50 scale-y-125 opacity-100 rounded-full"
                : "bg-sky-300/60 group-hover:bg-blue-500 group-hover:scale-y-110 opacity-0 group-hover:opacity-100 rounded-full"
          }`}
        />
      </div>

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

        {activeTab === "discover" && (
          <FindFriendsTab
            friendSearchQuery={friendSearchQuery}
            setFriendSearchQuery={setFriendSearchQuery}
            recommendedUsers={recommendedUsers}
            isRecommendationsLoading={isRecommendationsLoading}
            searchResults={searchResults}
            isSearching={isSearching}
            sendFriendRequest={sendFriendRequest}
            onOpenInvite={() => setIsInviteOpen(true)}
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