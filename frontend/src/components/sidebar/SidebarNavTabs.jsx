import React, { memo } from "react";
import { MessageSquare, Users, Sparkles, UserCheck, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useThemeStore } from "../../store/useThemeStore";

const TABS = [
  { id: "chats", label: "Chats", icon: MessageSquare },
  { id: "groups", label: "Groups", icon: Users },
  { id: "find", label: "Find", icon: Sparkles },
  { id: "requests", label: "Requests", icon: UserCheck },
];

const SidebarNavTabs = memo(({ activeTab, setActiveTab, pendingRequestsCount = 0, onCreateGroup }) => {
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";

  return (
    <div className={`px-3 py-2.5 transition-all ${
      isNeubrutalism
        ? 'bg-[#FFFDF0] border-b-3 border-black text-black'
        : 'border-b border-sky-100/80 bg-gradient-to-b from-white/90 to-sky-50/40'
    }`}>
      {/* Segmented Control Container */}
      <div className={`relative flex items-center p-1 transition-all ${
        isNeubrutalism
          ? 'bg-white border-3 border-black shadow-[3px_3px_0_#000] rounded-none gap-1'
          : 'bg-slate-200/60 backdrop-blur-md rounded-2xl border border-slate-200/70 shadow-inner gap-0.5'
      }`}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isRequestsTab = tab.id === "requests";

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 py-2 px-1.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none z-10 ${
                isNeubrutalism
                  ? isActive
                    ? "bg-[#FFE600] text-black font-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                    : "text-black hover:bg-yellow-100 rounded-none font-bold"
                  : isActive
                    ? "text-blue-700 font-bold"
                    : "text-gray-600 hover:text-gray-900 rounded-xl"
              }`}
            >
              {/* Animated Sliding Background Pill for default mode */}
              {!isNeubrutalism && isActive && (
                <motion.div
                  layoutId="sidebarActiveTabIndicator"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm border border-blue-200/60 z-[-1]"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}

              <Icon className={`w-3.5 h-3.5 ${isNeubrutalism ? "text-black" : isActive ? "text-blue-600 scale-110" : "text-gray-500"}`} />
              <span className="truncate">{tab.label}</span>

              {/* Pending Badge */}
              {isRequestsTab && pendingRequestsCount > 0 && (
                <span className={`px-1.5 py-0.5 text-[10px] font-bold transition-all ${
                  isNeubrutalism
                    ? "bg-[#FF007A] text-white border border-black font-black rounded-none"
                    : isActive
                      ? "bg-blue-600 text-white shadow-xs rounded-full"
                      : "bg-red-500 text-white animate-pulse rounded-full"
                }`}>
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-header for Group Channels when on Groups Tab */}
      {activeTab === "groups" && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2.5 flex items-center justify-between px-1"
        >
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 ${isNeubrutalism ? 'bg-black border border-black' : 'rounded-full bg-blue-500 animate-pulse'}`} />
            <span className={`text-[11px] font-black uppercase tracking-wider ${isNeubrutalism ? 'text-black' : 'text-slate-500'}`}>
              Group Channels
            </span>
          </div>
          <button
            onClick={onCreateGroup}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs transition-all cursor-pointer ${
              isNeubrutalism
                ? 'bg-[#FF007A] text-white font-black uppercase border-2 border-black shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 rounded-none'
                : 'bg-[linear-gradient(135deg,#1e40af_0%,#2563eb_75%,#38bdf8_100%)] border border-white/20 text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:scale-105'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create</span>
          </button>
        </motion.div>
      )}
    </div>
  );
});

SidebarNavTabs.displayName = "SidebarNavTabs";

export default SidebarNavTabs;
