import React, { useEffect } from 'react';
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

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
        background: radial-gradient(circle at 20% 20%, rgba(14, 165, 233, 0.85), transparent 60%),
                    radial-gradient(circle at 80% 30%, rgba(29, 78, 216, 0.9), transparent 60%),
                    radial-gradient(circle at 50% 80%, rgba(56, 189, 248, 0.4), transparent 50%),
                    linear-gradient(135deg, #1e3a8a, #0f172a);
        z-index: -1;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Logo Component
  const YapprLogo = () => (
    <div className="flex items-center justify-center py-3 lg:py-4 px-4 lg:px-6 bg-white/10 backdrop-blur-sm border-b border-white/20">
      <div className="flex items-center space-x-2 lg:space-x-3">
        <img
          src="/YapprIcon.png"
          alt="YAPPR Logo"
          className="w-8 h-8 lg:w-10 lg:h-10 object-contain drop-shadow-md"
        />
        {/* YAPPR Text */}
        <h1 className="text-2xl lg:text-4xl font-bold text-white tracking-wider">YAPPR</h1>
      </div>
    </div>
  );

  return (
    <>
      {/* Fixed Gradient Background */}
      <div className="gradient-bg-fixed" />

      {/* Main Content */}
      <div className="h-screen relative z-10">
        <div className="flex items-center justify-center pt-4 lg:pt-10 px-2 lg:px-4 h-full">
          <div className="bg-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl shadow-xl w-full max-w-6xl h-[calc(100vh-2rem)] lg:h-[calc(100vh-8rem)] border-2 border-white/50 overflow-hidden">
            {/* Logo Header */}
            <YapprLogo />
            
            {/* Chat Container */}
            <div className="flex h-[calc(100%-60px)] lg:h-[calc(100%-80px)] rounded-b-xl lg:rounded-b-2xl overflow-hidden bg-white/5 backdrop-blur-sm">
              {/* Sidebar - responsive behavior */}
              <div className={`transition-all duration-300 ease-in-out ${
                selectedUser 
                  ? 'w-0 lg:w-80 lg:min-w-80 lg:flex hidden lg:block' 
                  : 'w-full lg:w-80 lg:min-w-80'
              }`}>
                <Sidebar />
              </div>
              
              {/* Main Chat Area */}
              <div className={`bg-white/5 backdrop-blur-sm transition-all duration-300 ease-in-out ${
                selectedUser 
                  ? 'w-full lg:flex-1' 
                  : 'hidden lg:flex lg:flex-1'
              }`}>
                {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;