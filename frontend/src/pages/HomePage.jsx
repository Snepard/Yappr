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

      {/* Edge-to-Edge Mobile, Floating Rounded Desktop Workspace */}
      <div className="h-screen w-screen relative z-10 flex flex-col p-0 md:p-4 lg:p-5 overflow-hidden box-border transform-gpu">
        <div className="relative w-full h-full flex overflow-hidden rounded-none md:rounded-[2rem] lg:rounded-[2.25rem] border-0 md:border md:border-white/70 shadow-none md:shadow-[0_20px_60px_-15px_rgba(14,165,233,0.25)] bg-white/40 backdrop-blur-2xl ring-0 md:ring-1 md:ring-sky-500/20 transform-gpu">
          {/* Sidebar container */}
          <div
            className={`h-full flex-shrink-0 relative z-30 rounded-none md:rounded-l-[2rem] md:rounded-r-none overflow-hidden transform-gpu ${
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
            className={`flex-1 h-full flex flex-col min-w-0 bg-white/40 backdrop-blur-xl rounded-none md:rounded-r-[2rem] md:rounded-l-none overflow-hidden transition-all duration-300 ease-in-out transform-gpu ${
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
      </div>
    </>
  );
};

export default HomePage;