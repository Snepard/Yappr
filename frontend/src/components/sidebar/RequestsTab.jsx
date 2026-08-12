import React, { memo } from "react";
import { UserCheck, Check, X } from "lucide-react";
import SidebarSkeleton from "../skeletons/SidebarSkeleton";

const RequestsTab = memo(({
  pendingRequests,
  isRequestsLoading,
  acceptFriendRequest,
  declineFriendRequest,
}) => {
  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-1.5 px-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <UserCheck className="w-3.5 h-3.5 text-blue-500" />
        <span>Pending Requests ({pendingRequests.length})</span>
      </div>

      {isRequestsLoading ? (
        <SidebarSkeleton />
      ) : pendingRequests.length === 0 ? (
        <div className="text-center py-8 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <UserCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs font-medium text-gray-500">No pending friend requests</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pendingRequests.map((req) => (
            <div
              key={req._id}
              className="p-3 bg-white/80 border border-sky-100 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={req.sender?.profilePic || "/avatar.png"}
                  alt={req.sender?.fullName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100 flex-shrink-0"
                  onError={(e) => {
                    e.target.src = "/avatar.png";
                  }}
                />
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-gray-900 truncate">{req.sender?.fullName}</p>
                  <p className="text-[11px] font-medium text-blue-600 truncate">
                    @{req.sender?.username || req.sender?.email?.split("@")[0]}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => acceptFriendRequest(req._id)}
                  className="px-2.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow-md hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept</span>
                </button>
                <button
                  onClick={() => declineFriendRequest(req._id)}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
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
