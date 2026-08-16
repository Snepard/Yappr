import { MessageSquare, Users, Zap } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const NoChatSelected = ({ onOpenSidebar }) => {
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";

  return (
    <div className={`w-full flex flex-1 flex-col items-center justify-center p-8 lg:p-16 select-none ${
      isNeubrutalism
        ? "bg-[#FFFDF0] text-black"
        : "bg-gradient-to-br from-slate-50/60 via-blue-50/40 to-sky-50/50"
    }`}>
      <div className={`max-w-md text-center space-y-6 p-8 transition-all ${
        isNeubrutalism
          ? "bg-white border-4 border-black shadow-[8px_8px_0_#000] rounded-none text-black"
          : "bg-white/70 backdrop-blur-xl rounded-3xl border border-sky-100 shadow-sm"
      }`}>
        {/* Icon Display */}
        <div className="flex justify-center mb-4">
          <div className={`w-20 h-20 p-3 flex items-center justify-center transition-all duration-300 ${
            isNeubrutalism
              ? "bg-[#FFE600] border-3 border-black shadow-[4px_4px_0_#000] rounded-none"
              : "rounded-3xl bg-blue-50/80 shadow-md border border-sky-100 hover:scale-105"
          }`}>
            <img
              src="/YapprIcon.png"
              alt="YAPPR Logo"
              className="w-full h-full object-contain drop-shadow-xs"
            />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-2">
          <h2 className={
            isNeubrutalism
              ? "text-2xl sm:text-3xl font-black text-black uppercase tracking-wide"
              : "text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-600 bg-clip-text text-transparent"
          }>
            Welcome to YAPPR!
          </h2>
          
          <p className={
            isNeubrutalism
              ? "text-black/80 font-bold text-sm leading-relaxed"
              : "text-gray-500 text-sm leading-relaxed"
          }>
            Select a conversation from the sidebar to start chatting with your friends
          </p>
        </div>

        {/* Feature highlights */}
        <div className={`grid grid-cols-1 gap-3 pt-4 text-left ${
          isNeubrutalism
            ? "border-t-3 border-black"
            : "border-t border-sky-100/80"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 flex items-center justify-center ${
              isNeubrutalism
                ? "bg-[#00E5FF] text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                : "w-8 h-8 rounded-xl bg-blue-50 text-blue-600"
            }`}>
              <MessageSquare className={`w-4 h-4 ${isNeubrutalism ? "text-black stroke-[2.5]" : "text-blue-600"}`} />
            </div>
            <span className={isNeubrutalism ? "text-xs font-black text-black uppercase" : "text-xs font-semibold text-gray-600"}>Real-time instant messaging</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 flex items-center justify-center ${
              isNeubrutalism
                ? "bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                : "w-8 h-8 rounded-lg bg-sky-50 text-sky-600"
            }`}>
              <Users className={`w-4 h-4 ${isNeubrutalism ? "text-black stroke-[2.5]" : "text-sky-600"}`} />
            </div>
            <span className={isNeubrutalism ? "text-xs font-black text-black uppercase" : "text-xs font-semibold text-gray-600"}>See who's active & online</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 flex items-center justify-center ${
              isNeubrutalism
                ? "bg-[#FF007A] text-white border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                : "w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600"
            }`}>
              <Zap className={`w-4 h-4 ${isNeubrutalism ? "text-white stroke-[2.5]" : "text-cyan-600"}`} />
            </div>
            <span className={isNeubrutalism ? "text-xs font-black text-black uppercase" : "text-xs font-semibold text-gray-600"}>Share images & media instantly</span>
          </div>
        </div>

        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className={`md:hidden mt-4 w-full py-2.5 text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
              isNeubrutalism
                ? "bg-[#FFE600] text-black font-black uppercase rounded-none border-3 border-black shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
                : "bg-gradient-to-r from-blue-600 to-sky-600 text-white font-bold rounded-xl shadow-xs hover:opacity-90"
            }`}
          >
            <MessageSquare className="w-4 h-4" /> View Friends & Chats
          </button>
        )}
      </div>
    </div>
  );
};

export default NoChatSelected;