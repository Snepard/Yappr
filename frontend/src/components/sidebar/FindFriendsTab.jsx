import React, { memo } from "react";
import { Search, UserPlus, Check, Clock, Sparkles, Share2 } from "lucide-react";
import SidebarSkeleton from "../skeletons/SidebarSkeleton";
import { useThemeStore } from "../../store/useThemeStore";

const FindFriendsTab = memo(({
  friendSearchQuery,
  setFriendSearchQuery,
  recommendedUsers,
  isRecommendationsLoading,
  searchResults,
  isSearching,
  sendFriendRequest,
  onOpenInvite,
}) => {
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";

  const isSearchMode = Boolean(friendSearchQuery.trim());
  const displayList = isSearchMode ? searchResults : recommendedUsers;
  const isLoading = isSearchMode ? isSearching : isRecommendationsLoading;

  return (
    <div className="p-3 space-y-3.5">
      {/* Invite Friends Banner Card */}
      <div className={`p-3 px-3.5 flex items-center justify-between gap-3 transition-all ${
        isNeubrutalism
          ? 'bg-[#FFE600] text-black border-3 border-black shadow-[4px_4px_0_#000] rounded-none'
          : 'bg-gradient-to-r from-blue-50/80 via-sky-50/60 to-indigo-50/80 border border-blue-200/60 rounded-2xl'
      }`}>
        <div className="min-w-0">
          <p className={`text-xs ${isNeubrutalism ? 'font-black uppercase' : 'font-bold text-slate-800'}`}>Invite Friends</p>
          <p className={`text-[11px] truncate ${isNeubrutalism ? 'font-extrabold text-black' : 'font-medium text-slate-500'}`}>Share your link to start chatting</p>
        </div>
        <button
          onClick={onOpenInvite}
          className={`px-3.5 py-1.5 text-xs font-black uppercase shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
            isNeubrutalism
              ? 'bg-[#FF007A] text-white border-2 border-black shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 rounded-none'
              : 'bg-[linear-gradient(135deg,#1e40af_0%,#2563eb_75%,#38bdf8_100%)] text-white font-bold rounded-xl shadow-xs hover:scale-105'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Invite</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isNeubrutalism ? 'text-black' : 'text-blue-400'}`} />
        <input
          type="text"
          placeholder="Search @username or name..."
          value={friendSearchQuery}
          onChange={(e) => setFriendSearchQuery(e.target.value)}
          className={`w-full pl-9 pr-3 py-2 text-xs transition-all ${
            isNeubrutalism
              ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] focus:shadow-[5px_5px_0_#000] focus:outline-none rounded-none font-bold placeholder:text-gray-500'
              : 'bg-blue-50/50 border border-blue-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30'
          }`}
        />
      </div>

      {/* Header */}
      <div className={`flex items-center gap-1.5 px-1 text-xs uppercase tracking-wider ${
        isNeubrutalism ? 'text-black font-black' : 'font-semibold text-gray-500'
      }`}>
        <Sparkles className={`w-3.5 h-3.5 ${isNeubrutalism ? 'text-black' : 'text-blue-500'}`} />
        <span>{isSearchMode ? "Search Results" : "People You May Know"}</span>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <SidebarSkeleton />
      ) : displayList.length === 0 ? (
        <div className={`text-center py-8 px-4 ${
          isNeubrutalism
            ? 'bg-white border-3 border-black border-dashed rounded-none text-black font-bold'
            : 'bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-gray-500'
        }`}>
          <UserPlus className={`w-8 h-8 mx-auto mb-2 ${isNeubrutalism ? 'text-black' : 'text-gray-300'}`} />
          <p className="text-xs font-medium">
            {isSearchMode ? `No users matching "${friendSearchQuery}"` : "No recommendations right now"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayList.map((user) => {
            const status = user.relationshipStatus || "none";

            return (
              <div
                key={user._id}
                className={`p-3 transition-all flex items-center justify-between gap-3 ${
                  isNeubrutalism
                    ? 'bg-white border-3 border-black shadow-[4px_4px_0_#000] rounded-none text-black'
                    : 'bg-white/80 border border-sky-100 rounded-2xl shadow-2xs hover:shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
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
                    <p className={`text-xs truncate ${isNeubrutalism ? 'font-black text-black' : 'font-semibold text-gray-900'}`}>{user.fullName}</p>
                    <p className={`text-[11px] truncate ${isNeubrutalism ? 'font-extrabold text-black/70' : 'font-medium text-blue-600'}`}>
                      @{user.username || user.email?.split("@")[0]}
                    </p>
                  </div>
                </div>

                {status === "none" && (
                  <button
                    onClick={() => sendFriendRequest(user._id)}
                    className={`px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1 flex-shrink-0 transition-all cursor-pointer ${
                      isNeubrutalism
                        ? 'bg-[#00E5FF] text-black border-2 border-black shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 rounded-none'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-xs hover:scale-105 font-semibold'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                )}

                {status === "sent" && (
                  <span className={`px-2.5 py-1 text-[11px] font-black uppercase flex items-center gap-1 flex-shrink-0 ${
                    isNeubrutalism
                      ? 'bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none'
                      : 'bg-amber-50 text-amber-700 border border-amber-200/60 rounded-xl font-semibold'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>Pending</span>
                  </span>
                )}

                {status === "received" && (
                  <span className={`px-2.5 py-1 text-[11px] font-black uppercase flex items-center gap-1 flex-shrink-0 ${
                    isNeubrutalism
                      ? 'bg-[#00E5FF] text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none'
                      : 'bg-blue-50 text-blue-700 border border-blue-200/60 rounded-xl font-semibold'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>Request Received</span>
                  </span>
                )}

                {status === "friend" && (
                  <span className={`px-2.5 py-1 text-[11px] font-black uppercase flex items-center gap-1 flex-shrink-0 ${
                    isNeubrutalism
                      ? 'bg-[#00E676] text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-xl font-semibold'
                  }`}>
                    <Check className="w-3 h-3" />
                    <span>Friends</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

FindFriendsTab.displayName = "FindFriendsTab";

export default FindFriendsTab;
