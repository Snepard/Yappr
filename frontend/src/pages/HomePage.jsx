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
        background: radial-gradient(circle at 20% 20%, rgba(108, 0, 162, 0.85), transparent 60%),
                    radial-gradient(circle at 80% 30%, rgba(0, 17, 82, 0.9), transparent 60%),
                    radial-gradient(circle at 50% 80%, rgba(221, 74, 255, 0.4), transparent 50%),
                    linear-gradient(135deg, #4c1d95, #1e1b4b);
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
        {/* Chat Icon */}
        <div className="relative">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5 lg:p-2">
            <svg className="w-6 h-6 lg:w-8 lg:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 12C8 10.8954 7.10457 10 6 10C4.89543 10 4 10.8954 4 12C4 13.1046 4.89543 14 6 14C7.10457 14 8 13.1046 8 12Z"/>
              <path d="M12 12C12 10.8954 11.1046 10 10 10C8.89543 10 8 10.8954 8 12C8 13.1046 8.89543 14 10 14C11.1046 14 12 13.1046 12 12Z"/>
              <path d="M16 12C16 10.8954 15.1046 10 14 10C12.8954 10 12 10.8954 12 12C12 13.1046 12.8954 14 14 14C15.1046 14 16 13.1046 16 12Z"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M2 8C2 5.79086 3.79086 4 6 4H14C16.2091 4 18 5.79086 18 8V12C18 14.2091 16.2091 16 14 16H8.41421L6.70711 17.7071C6.07714 18.3371 5 17.8909 5 17V16C3.34315 16 2 14.6569 2 13V8ZM6 6C4.89543 6 4 6.89543 4 8V13C4 13.5523 4.44772 14 5 14C5.55228 14 6 14.4477 6 15V15.5858L7.29289 14.2929C7.48043 14.1054 7.73478 14 8 14H14C15.1046 14 16 13.1046 16 12V8C16 6.89543 15.1046 6 14 6H6Z"/>
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white/30 backdrop-blur-sm rounded-md p-0.5 lg:p-1">
            <svg className="w-3 h-3 lg:w-5 lg:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12C9 10.8954 8.10457 10 7 10C5.89543 10 5 10.8954 5 12C5 13.1046 5.89543 14 7 14C8.10457 14 9 13.1046 9 12Z"/>
              <path d="M13 12C13 10.8954 12.1046 10 11 10C9.89543 10 9 10.8954 9 12C9 13.1046 9.89543 14 11 14C12.1046 14 13 13.1046 13 12Z"/>
              <path d="M17 12C17 10.8954 16.1046 10 15 10C13.8954 10 13 10.8954 13 12C13 13.1046 13.8954 14 15 14C16.1046 14 17 13.1046 17 12Z"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M20 8C20 5.79086 18.2091 4 16 4H10C7.79086 4 6 5.79086 6 8V9H8V8C8 6.89543 8.89543 6 10 6H16C17.1046 6 18 6.89543 18 8V12C18 13.1046 17.1046 14 16 14H15V16H16C18.2091 16 20 14.2091 20 12V8Z"/>
            </svg>
          </div>
        </div>
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