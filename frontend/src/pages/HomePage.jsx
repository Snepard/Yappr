import React, { useState } from 'react';
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import InvitePanel from "../components/InvitePanel";
import CreateGroupPanel from "../components/CreateGroupPanel";
import GroupInfoPanel from "../components/GroupInfoPanel";

const HomePage = () => {
  const { selectedUser, isInviteOpen } = useChatStore();
  const { selectedGroup, isCreatingGroup, isGroupInfoOpen, setIsGroupInfoOpen } = useGroupStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const showGroupInfo = Boolean(isGroupInfoOpen && selectedGroup);
  const hasActiveChat = Boolean(selectedUser || selectedGroup);
  const isRightWindowActive = Boolean(hasActiveChat || isInviteOpen || isCreatingGroup || showGroupInfo);

  return (
    <>
      {/* Fixed Light Gradient Background */}
      <div className="gradient-bg-fixed" />

      {/* Full-Screen Edge-to-Edge Application Workspace */}
      <div className="h-screen w-screen relative z-10 flex overflow-hidden bg-slate-900/5 backdrop-blur-md transform-gpu">
        {/* Sidebar container */}
        <div
          className={`h-full transition-all duration-300 ease-in-out flex-shrink-0 border-r border-sky-200/60 bg-white/80 backdrop-blur-2xl relative z-30 transform-gpu ${
            isRightWindowActive ? 'hidden md:flex' : 'flex w-full md:w-auto'
          }`}
        >
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        </div>

        {/* Main Right Window (Chat / Invite / Create Group / Group Info / Empty State) */}
        <div
          className={`flex-1 h-full flex flex-col min-w-0 bg-white/40 backdrop-blur-xl transition-all duration-300 ease-in-out transform-gpu ${
            isRightWindowActive ? 'flex w-full' : 'hidden md:flex'
          }`}
        >
          {isInviteOpen ? (
            <InvitePanel />
          ) : isCreatingGroup ? (
            <CreateGroupPanel />
          ) : showGroupInfo ? (
            <GroupInfoPanel onClose={() => setIsGroupInfoOpen(false)} />
          ) : !hasActiveChat ? (
            <NoChatSelected onOpenSidebar={() => setIsSidebarCollapsed(false)} />
          ) : (
            <ChatContainer
              isSidebarCollapsed={isSidebarCollapsed}
              setIsSidebarCollapsed={setIsSidebarCollapsed}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default HomePage;