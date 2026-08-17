import React, { useState } from 'react';
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useThemeStore } from "../store/useThemeStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import InvitePanel from "../components/InvitePanel";
import PendingRequestsPanel from "../components/PendingRequestsPanel";
import CreateGroupPanel from "../components/CreateGroupPanel";
import GroupInfoPanel from "../components/GroupInfoPanel";

const HomePage = () => {
  const { selectedUser, isInviteOpen, isRequestsOpen } = useChatStore();
  const { selectedGroup, isCreatingGroup, isGroupInfoOpen, setIsGroupInfoOpen } = useGroupStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === 'neubrutalism';

  const showGroupInfo = Boolean(isGroupInfoOpen && selectedGroup);
  const hasActiveChat = Boolean(selectedUser || selectedGroup);
  const isRightWindowActive = Boolean(hasActiveChat || isInviteOpen || isRequestsOpen || isCreatingGroup || showGroupInfo);

  return (
    <>
      {/* Fixed Background */}
      <div className="gradient-bg-fixed" />

      {/* Edge-to-Edge Mobile, Floating Desktop Workspace */}
      <div className="h-screen w-screen relative z-10 flex flex-col p-0 md:p-4 lg:p-5 overflow-hidden box-border transform-gpu">
        <div className={`relative w-full h-full flex overflow-hidden transition-all duration-200 ${
          isNeubrutalism
            ? 'rounded-none md:border-4 md:border-black md:shadow-[8px_8px_0_#000000] bg-white'
            : 'rounded-none md:rounded-[2rem] lg:rounded-[2.25rem] border-0 md:border md:border-white/70 shadow-none md:shadow-[0_20px_60px_-15px_rgba(14,165,233,0.25)] bg-white/40 backdrop-blur-2xl ring-0 md:ring-1 md:ring-sky-500/20'
        }`}>
          {/* Sidebar container */}
          <div
            className={`h-full flex-shrink-0 relative z-30 rounded-none overflow-hidden transform-gpu ${
              isRightWindowActive ? 'hidden md:flex' : 'flex w-full md:w-auto'
            } ${isNeubrutalism ? 'border-r-0 md:border-r-4 md:border-black' : ''}`}
          >
            <Sidebar
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
            />
          </div>

          {/* Main Right Window */}
          <div
            className={`flex-1 h-full flex flex-col min-w-0 rounded-none overflow-hidden transition-all duration-300 ease-in-out transform-gpu ${
              isRightWindowActive ? 'flex w-full' : 'hidden md:flex'
            } ${isNeubrutalism ? 'bg-[#FFFDF0]' : 'bg-white/40 backdrop-blur-xl'}`}
          >
            {isInviteOpen ? (
              <InvitePanel />
            ) : isRequestsOpen ? (
              <PendingRequestsPanel />
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