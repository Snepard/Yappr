import React, { useEffect, useState } from 'react';
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import InvitePanel from "../components/InvitePanel";

const HomePage = () => {
  const { selectedUser, isInviteOpen } = useChatStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Add the CSS variables and styles to the document
    const style = document.createElement('style');
    style.textContent = `
      .gradient-bg-fixed {
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        overflow: hidden;
        background: radial-gradient(circle at 20% 20%, rgba(14, 165, 233, 0.4), transparent 60%),
                    radial-gradient(circle at 80% 30%, rgba(29, 78, 216, 0.45), transparent 60%),
                    radial-gradient(circle at 50% 80%, rgba(56, 189, 248, 0.3), transparent 50%),
                    linear-gradient(135deg, #e0f2fe, #f0f9ff, #dbeafe);
        z-index: -1;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      {/* Fixed Light Gradient Background */}
      <div className="gradient-bg-fixed" />

      {/* Full-Screen Edge-to-Edge Application Workspace */}
      <div className="h-screen w-screen relative z-10 flex overflow-hidden bg-slate-900/5 backdrop-blur-md">
        {/* Sidebar container */}
        <div
          className={`h-full transition-all duration-300 ease-in-out flex-shrink-0 border-r border-sky-200/60 bg-white/80 backdrop-blur-2xl relative z-30 ${
            selectedUser || isInviteOpen ? 'hidden md:flex' : 'flex w-full md:w-auto'
          }`}
        >
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        </div>

        {/* Main Right Window (Chat / Invite / Empty State) */}
        <div
          className={`flex-1 h-full flex flex-col min-w-0 bg-white/40 backdrop-blur-xl transition-all duration-300 ease-in-out ${
            selectedUser || isInviteOpen ? 'flex w-full' : 'hidden md:flex'
          }`}
        >
          {isInviteOpen ? (
            <InvitePanel />
          ) : !selectedUser ? (
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