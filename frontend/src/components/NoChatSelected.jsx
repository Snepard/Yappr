import { MessageSquare, Users, Zap } from "lucide-react";

const NoChatSelected = ({ onOpenSidebar }) => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-8 lg:p-16 bg-gradient-to-br from-slate-50/60 via-blue-50/40 to-sky-50/50 select-none">
      <div className="max-w-md text-center space-y-6 bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-sky-100 shadow-sm">
        {/* Icon Display */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-3xl bg-blue-50/80 p-3
                         flex items-center justify-center shadow-md border border-sky-100
                         hover:scale-105 transition-all duration-300">
            <img
              src="/YapprIcon.png"
              alt="YAPPR Logo"
              className="w-full h-full object-contain drop-shadow-xs"
            />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-600 
                         bg-clip-text text-transparent">
            Welcome to YAPPR!
          </h2>
          
          <p className="text-gray-500 text-sm leading-relaxed">
            Select a conversation from the sidebar to start chatting with your friends
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 gap-3 pt-4 border-t border-sky-100/80 text-left">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs font-semibold">Real-time instant messaging</span>
          </div>
          
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-xs font-semibold">See who's active & online</span>
          </div>
          
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
              <Zap className="w-4 h-4 text-cyan-600" />
            </div>
            <span className="text-xs font-semibold">Share images & media instantly</span>
          </div>
        </div>

        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="md:hidden mt-4 w-full py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-bold text-xs rounded-xl shadow-xs hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" /> View Friends & Chats
          </button>
        )}
      </div>
    </div>
  );
};

export default NoChatSelected;