import React, { memo } from "react";
import { UserCheck, ChevronRight, ArrowRight } from "lucide-react";
import SidebarSkeleton from "../skeletons/SidebarSkeleton";
import { useThemeStore } from "../../store/useThemeStore";
import { useChatStore } from "../../store/useChatStore";

const RequestsTab = memo(({
  pendingRequests = [],
  isRequestsLoading = false,
}) => {
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";
  const setIsRequestsOpen = useChatStore((state) => state.setIsRequestsOpen);

  if (isRequestsLoading) {
    return <div className="p-3"><SidebarSkeleton /></div>;
  }

  if (!pendingRequests || pendingRequests.length === 0) {
    return (
      <div className={`p-4 text-center ${
        isNeubrutalism
          ? 'bg-white border-3 border-black border-dashed rounded-none text-black font-bold'
          : 'bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-gray-500'
      }`}>
        <UserCheck className={`w-8 h-8 mx-auto mb-2 ${isNeubrutalism ? 'text-black' : 'text-gray-300'}`} />
        <p className="text-xs font-medium">No pending friend requests</p>
      </div>
    );
  }

  return (
    <div className="p-3">
      <button
        type="button"
        onClick={() => setIsRequestsOpen(true)}
        className={`w-full p-3 px-3.5 text-left transition-all cursor-pointer group flex items-center justify-between gap-3 ${
          isNeubrutalism
            ? 'bg-[#00E5FF] text-black border-3 border-black shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_#000] rounded-none'
            : 'bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-indigo-500/10 border border-blue-200/80 hover:border-blue-400/80 hover:bg-gradient-to-r hover:from-blue-500/15 hover:via-sky-500/15 hover:to-indigo-500/15 rounded-2xl shadow-2xs hover:shadow-xs'
        }`}
        title="Open Pending Requests Panel on the right side"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
            isNeubrutalism
              ? 'bg-black text-white border-2 border-black rounded-none shadow-[2px_2px_0_#000]'
              : 'bg-blue-600 text-white rounded-xl shadow-xs'
          }`}>
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className={`text-xs ${isNeubrutalism ? 'font-black uppercase text-black' : 'font-bold text-slate-800'}`}>
              Pending Requests
            </span>
            <p className={`text-[11px] truncate ${isNeubrutalism ? 'font-extrabold text-black/80' : 'font-medium text-blue-600'}`}>
              {pendingRequests.length === 1 ? "1 request waiting" : `${pendingRequests.length} requests waiting`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-0.5 text-[11px] font-bold transition-all ${
            isNeubrutalism
              ? 'bg-[#FF007A] text-white border-2 border-black font-black uppercase rounded-none shadow-[1px_1px_0_#000]'
              : 'bg-blue-600 text-white font-bold rounded-full px-2.5 py-0.5 shadow-2xs group-hover:bg-blue-700'
          }`}>
            {pendingRequests.length}
          </span>
          {isNeubrutalism ? (
            <ArrowRight className="w-4 h-4 text-black stroke-[3] group-hover:translate-x-0.5 transition-transform" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          )}
        </div>
      </button>
    </div>
  );
});

RequestsTab.displayName = "RequestsTab";

export default RequestsTab;
