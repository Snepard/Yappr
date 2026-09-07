import React, { useState, useEffect } from "react";
import { useYapStore } from "../store/useYapStore";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import {
  Flame,
  Coffee,
  KeyRound,
  UserPlus,
  Users,
  Search,
  Check,
  X,
  ArrowRight,
  Shield,
} from "lucide-react";

const YapLobbyPanel = () => {
  const { createSession, joinSession, closeYapLobby, isCreating, isJoining } = useYapStore();
  const { users, getUsers, isUsersLoading } = useChatStore();
  const authUser = useAuthStore((state) => state.authUser);
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";

  const [activeTab, setActiveTab] = useState("invite"); // "invite" | "code"
  const [sessionCodeInput, setSessionCodeInput] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const toggleSelectFriend = (friendId) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    );
  };

  const handleStartSession = async () => {
    try {
      await createSession(selectedFriendIds);
    } catch (err) {
      // Handled in store
    }
  };

  const handleJoinWithCode = async (e) => {
    e?.preventDefault();
    if (!sessionCodeInput.trim()) return;
    try {
      await joinSession(sessionCodeInput.trim().toUpperCase());
    } catch (err) {
      // Handled in store
    }
  };

  const filteredFriends = (Array.isArray(users) ? users : []).filter(
    (u) =>
      u._id !== authUser?._id &&
      (u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      className={`h-full w-full flex flex-col overflow-hidden ${
        isNeubrutalism
          ? "bg-[#FFFDF0] text-black rounded-none md:border-3 md:border-black md:shadow-[4px_4px_0_#000]"
          : "bg-[#0b0f17] text-slate-100 rounded-xl md:rounded-2xl border-y border-slate-800/80 md:border md:border-slate-800/90 md:shadow-2xl"
      }`}
    >
      {/* Top Header */}
      <div
        className={`px-5 pt-4 pb-3.5 sm:pt-5 sm:pb-4 flex items-center justify-between border-b ${
          isNeubrutalism
            ? "border-b-4 border-black bg-[#FFE600]"
            : "border-slate-800/90 bg-[#101622]"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 flex items-center justify-center ${
              isNeubrutalism
                ? "bg-[#FF007A] text-white border-3 border-black shadow-[3px_3px_0_#000] rounded-none"
                : "rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30"
            }`}
          >
            <Coffee className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2
                className={`text-base sm:text-lg font-bold ${
                  isNeubrutalism ? "uppercase tracking-wide text-black font-black" : "text-white"
                }`}
              >
                Tea Time
              </h2>
            </div>
            <p
              className={`text-xs mt-0.5 ${
                isNeubrutalism ? "font-bold text-black/70" : "text-slate-400"
              }`}
            >
              Messages automatically vanish when everyone leaves.
            </p>
          </div>
        </div>

        <button
          onClick={closeYapLobby}
          className={`p-2 transition-all cursor-pointer ${
            isNeubrutalism
              ? "bg-white border-2 border-black shadow-[2px_2px_0_#000] hover:bg-yellow-200 active:translate-x-0.5 active:translate-y-0.5 rounded-none text-black"
              : "rounded-lg bg-[#192231] text-slate-300 hover:text-white hover:bg-[#202b3d] border border-slate-700/60"
          }`}
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Basic Info Notice */}
      <div
        className={`px-5 py-2.5 flex items-center gap-2.5 text-xs ${
          isNeubrutalism
            ? "bg-[#00E5FF] text-black border-b-3 border-black font-black uppercase"
            : "bg-[#121927] text-slate-300 border-b border-slate-800/80"
        }`}
      >
        <Shield className={`w-4 h-4 flex-shrink-0 ${isNeubrutalism ? "text-black" : "text-orange-400"}`} />
        <span>No chat history is saved on any server or device.</span>
      </div>

      {/* Mode Switcher */}
      <div className="px-5 pt-4">
        <div
          className={`flex items-center gap-2 p-1 ${
            isNeubrutalism
              ? "bg-white border-3 border-black shadow-[3px_3px_0_#000] rounded-none"
              : "bg-[#101622] rounded-xl border border-slate-800"
          }`}
        >
          <button
            onClick={() => setActiveTab("invite")}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isNeubrutalism
                ? activeTab === "invite"
                  ? "bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none font-black"
                  : "text-black hover:bg-yellow-100 rounded-none"
                : activeTab === "invite"
                ? "bg-orange-500 text-white font-bold rounded-lg shadow-sm"
                : "text-slate-400 hover:text-white rounded-lg"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Friends</span>
            {selectedFriendIds.length > 0 && (
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                  isNeubrutalism ? "bg-black text-white" : "bg-white text-orange-600"
                }`}
              >
                {selectedFriendIds.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("code")}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isNeubrutalism
                ? activeTab === "code"
                  ? "bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none font-black"
                  : "text-black hover:bg-yellow-100 rounded-none"
                : activeTab === "code"
                ? "bg-orange-500 text-white font-bold rounded-lg shadow-sm"
                : "text-slate-400 hover:text-white rounded-lg"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Enter with Code</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 min-h-0">
        {activeTab === "invite" ? (
          <div className="flex flex-col h-full space-y-3">
            {/* Friends Search Filter */}
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isNeubrutalism ? "text-black" : "text-slate-400"
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search friends..."
                className={`w-full pl-9 pr-4 py-2.5 text-sm transition-all focus:outline-none ${
                  isNeubrutalism
                    ? "bg-white border-2 border-black shadow-[2px_2px_0_#000] rounded-none font-bold text-black focus:bg-yellow-50"
                    : "bg-[#131a26] border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:border-orange-500/80"
                }`}
              />
            </div>

            {/* Friends List Container */}
            <div
              className={`flex-1 overflow-y-auto rounded-xl p-2 space-y-1 min-h-[220px] ${
                isNeubrutalism
                  ? "bg-white border-3 border-black shadow-[3px_3px_0_#000] rounded-none"
                  : "bg-[#101622] border border-slate-800"
              }`}
            >
              {isUsersLoading ? (
                <div className="flex items-center justify-center h-40 text-xs text-slate-400">
                  Loading friends...
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                  <Users className="w-8 h-8 text-slate-500 mb-2 opacity-60" />
                  <p className={`text-xs ${isNeubrutalism ? "text-black font-bold" : "text-slate-400"}`}>
                    {searchQuery ? "No friends matching search" : "No friends found. You can still create a room and share your code."}
                  </p>
                </div>
              ) : (
                filteredFriends.map((friend) => {
                  const isSelected = selectedFriendIds.includes(friend._id);
                  return (
                    <div
                      key={friend._id}
                      onClick={() => toggleSelectFriend(friend._id)}
                      className={`flex items-center justify-between p-2.5 cursor-pointer rounded-lg transition-colors ${
                        isNeubrutalism
                          ? isSelected
                            ? "bg-[#00E5FF] border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                            : "bg-white hover:bg-yellow-100 border border-black/30 rounded-none"
                          : isSelected
                          ? "bg-orange-950/30 border border-orange-500/40 text-white"
                          : "hover:bg-[#161e2d] border border-transparent text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={friend.profilePic || "/avatar.png"}
                          alt={friend.fullName}
                          className={`w-9 h-9 object-cover ${
                            isNeubrutalism ? "border-2 border-black rounded-none" : "rounded-lg"
                          }`}
                        />
                        <div>
                          <p className={`text-sm font-semibold ${isNeubrutalism ? "text-black font-black" : "text-white"}`}>
                            {friend.fullName}
                          </p>
                          <p className={`text-xs ${isNeubrutalism ? "text-black/70 font-bold" : "text-slate-400"}`}>
                            @{friend.username}
                          </p>
                        </div>
                      </div>

                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 flex items-center justify-center transition-all ${
                          isNeubrutalism
                            ? isSelected
                              ? "bg-black text-white border-2 border-black rounded-none"
                              : "border-2 border-black bg-white rounded-none"
                            : isSelected
                            ? "bg-orange-500 text-white rounded-md shadow-xs"
                            : "border border-slate-600 rounded-md bg-[#182130]"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Launch Action */}
            <div className="pt-2">
              <button
                onClick={handleStartSession}
                disabled={isCreating}
                className={`w-full py-2.5 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isNeubrutalism
                    ? "bg-[#FF007A] text-white border-3 border-black shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 rounded-none uppercase disabled:opacity-50"
                    : "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 rounded-xl disabled:opacity-50"
                }`}
              >
                {isCreating ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-xs" />
                    Creating room...
                  </span>
                ) : (
                  <>
                    <Coffee className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {selectedFriendIds.length > 0
                        ? `Start Tea Time & Invite (${selectedFriendIds.length})`
                        : "Start Empty Room"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Tab B: Join via Code */
          <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto text-center space-y-5">
            <div
              className={`p-3.5 flex items-center justify-center ${
                isNeubrutalism
                  ? "bg-[#00E5FF] text-black border-3 border-black shadow-[3px_3px_0_#000] rounded-none"
                  : "bg-orange-500/10 text-orange-400 border border-orange-500/25 rounded-2xl"
              }`}
            >
              <KeyRound className="w-8 h-8 stroke-[2]" />
            </div>

            <div className="space-y-1">
              <h3 className={`text-base font-bold ${isNeubrutalism ? "text-black uppercase font-black" : "text-white"}`}>
                Enter Room Code
              </h3>
              <p className={`text-xs ${isNeubrutalism ? "text-black/70 font-bold" : "text-slate-400"}`}>
                Ask your friend for the 6-character room code.
              </p>
            </div>

            <form onSubmit={handleJoinWithCode} className="w-full space-y-4">
              <div className="flex justify-center">
                <input
                  type="text"
                  maxLength={6}
                  value={sessionCodeInput}
                  onChange={(e) => setSessionCodeInput(e.target.value.toUpperCase())}
                  placeholder="X9K2LM"
                  className={`w-48 text-center py-2.5 text-xl font-mono tracking-[0.25em] font-bold uppercase transition-all focus:outline-none ${
                    isNeubrutalism
                      ? "bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] rounded-none focus:bg-yellow-50"
                      : "bg-[#131a26] text-orange-400 border border-slate-700 rounded-xl focus:border-orange-500"
                  }`}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isJoining || sessionCodeInput.trim().length < 6}
                className={`w-full py-2.5 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isNeubrutalism
                    ? "bg-[#FFE600] text-black border-3 border-black shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 rounded-none uppercase disabled:opacity-50"
                    : "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 rounded-xl disabled:opacity-50"
                }`}
              >
                {isJoining ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-xs" />
                    Joining room...
                  </span>
                ) : (
                  <span>Join Room</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default YapLobbyPanel;
