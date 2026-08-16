import React, { memo } from "react";
import { UserCheck, Check, X } from "lucide-react";
import SidebarSkeleton from "../skeletons/SidebarSkeleton";
import { useThemeStore } from "../../store/useThemeStore";

const RequestsTab = memo(({
  pendingRequests,
  isRequestsLoading,
  acceptFriendRequest,
  declineFriendRequest,
}) => {
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";

  return (
    <div className="p-3 space-y-3">
      <div className={`flex items-center gap-1.5 px-1 text-xs uppercase tracking-wider ${
        isNeubrutalism ? 'text-black font-black' : 'font-semibold text-gray-500'
      }`}>
        <UserCheck className={`w-3.5 h-3.5 ${isNeubrutalism ? 'text-black' : 'text-blue-500'}`} />
        <span>Pending Requests ({pendingRequests.length})</span>
      </div>

      {isRequestsLoading ? (
        <SidebarSkeleton />
      ) : pendingRequests.length === 0 ? (
        <div className={`text-center py-8 px-4 ${
          isNeubrutalism
            ? 'bg-white border-3 border-black border-dashed rounded-none text-black font-bold'
            : 'bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-gray-500'
        }`}>
          <UserCheck className={`w-8 h-8 mx-auto mb-2 ${isNeubrutalism ? 'text-black' : 'text-gray-300'}`} />
          <p className="text-xs font-medium">No pending friend requests</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pendingRequests.map((req) => (
            <div
              key={req._id}
              className={`p-3 transition-all flex items-center justify-between gap-2 ${
                isNeubrutalism
                  ? 'bg-white border-3 border-black shadow-[4px_4px_0_#000] rounded-none text-black'
                  : 'bg-white/80 border border-sky-100 rounded-2xl shadow-2xs hover:shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={req.sender?.profilePic || "/avatar.png"}
                  alt={req.sender?.fullName}
                  className={`w-10 h-10 object-cover flex-shrink-0 ${
                    isNeubrutalism
                      ? 'border-2 border-black rounded-none shadow-[2px_2px_0_#000]'
                      : 'rounded-full ring-2 ring-blue-100'
                  }`}
                  onError={(e) => {
                    e.target.src = "/avatar.png";
                  }}
                />
                <div className="min-w-0">
                  <p className={`text-xs truncate ${isNeubrutalism ? 'font-black text-black' : 'font-semibold text-gray-900'}`}>{req.sender?.fullName}</p>
                  <p className={`text-[11px] truncate ${isNeubrutalism ? 'font-extrabold text-black/70' : 'font-medium text-blue-600'}`}>
                    @{req.sender?.username || req.sender?.email?.split("@")[0]}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => acceptFriendRequest(req._id)}
                  className={`px-2.5 py-1.5 text-xs font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
                    isNeubrutalism
                      ? 'bg-[#00E676] text-black border-2 border-black shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 rounded-none'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-xs hover:scale-105 font-semibold'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Accept</span>
                </button>
                <button
                  onClick={() => declineFriendRequest(req._id)}
                  className={`px-2.5 py-1.5 text-xs font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
                    isNeubrutalism
                      ? 'bg-[#FF007A] text-white border-2 border-black shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 rounded-none'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold'
                  }`}
                >
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Decline</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

RequestsTab.displayName = "RequestsTab";

export default RequestsTab;
