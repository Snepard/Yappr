import React from "react";
import {
  X,
  UserCheck,
  Check,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFriendStore } from "../store/useFriendStore";
import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

const PendingRequestsPanel = () => {
  const {
    pendingRequests,
    isRequestsLoading,
    acceptFriendRequest,
    declineFriendRequest,
  } = useFriendStore();

  const { setIsRequestsOpen } = useChatStore();
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";

  return (
    <div
      className={`flex-1 flex items-center justify-center p-4 sm:p-6 transition-all overflow-hidden h-full ${
        isNeubrutalism
          ? "bg-[#FFFDF0] text-black"
          : "bg-gradient-to-br from-slate-50/70 via-blue-50/40 to-sky-50/60 backdrop-blur-xl"
      }`}
    >
      {/* Standardized Outer Frame Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className={`relative w-full max-w-2xl h-[560px] sm:h-[600px] max-h-[85vh] overflow-hidden flex flex-col transition-all ${
          isNeubrutalism
            ? "bg-white border-4 border-black shadow-[8px_8px_0_#000] rounded-none text-black"
            : "bg-white/80 backdrop-blur-2xl backdrop-saturate-200 rounded-3xl shadow-[0_20px_60px_rgba(14,165,233,0.15)] border border-white/90 ring-1 ring-sky-500/15"
        }`}
      >
        {!isNeubrutalism && (
          <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-white/40 via-transparent to-transparent rotate-45 pointer-events-none" />
        )}

        {/* Top Header */}
        <div
          className={`p-5 sm:p-6 text-center relative flex-shrink-0 ${
            isNeubrutalism
              ? "bg-[#FFE600] text-black border-b-4 border-black"
              : "bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white shadow-xs"
          }`}
        >
          <button
            onClick={() => setIsRequestsOpen(false)}
            className={`absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 transition-all cursor-pointer ${
              isNeubrutalism
                ? "bg-black text-white border border-black hover:bg-[#FF007A] rounded-none shadow-[2px_2px_0_#000]"
                : "rounded-full bg-white/20 hover:bg-white/30 text-white hover:scale-105 active:scale-95"
            }`}
            title="Close"
          >
            <X className={`w-4 h-4 sm:w-5 sm:h-5 ${isNeubrutalism ? "stroke-[3]" : ""}`} />
          </button>

          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mx-auto mb-2.5 sm:mb-3 ${
              isNeubrutalism
                ? "bg-black text-white border-2 border-black shadow-[3px_3px_0_#000] rounded-none"
                : "bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-inner"
            }`}
          >
            <UserCheck className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h2
            className={`text-lg sm:text-xl font-black ${
              isNeubrutalism ? "uppercase tracking-tight text-black" : "tracking-wide text-white font-extrabold"
            }`}
          >
            Pending Friend Requests
          </h2>
          <p
            className={`text-xs mt-0.5 sm:mt-1 ${
              isNeubrutalism ? "text-black font-extrabold" : "text-blue-100 font-medium"
            }`}
          >
            {pendingRequests.length === 1
              ? "You have 1 pending request waiting for approval"
              : `You have ${pendingRequests.length} pending requests waiting for approval`}
          </p>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
          {isRequestsLoading ? (
            <SidebarSkeleton />
          ) : pendingRequests.length === 0 ? (
            <div
              className={`text-center py-16 px-4 flex flex-col items-center justify-center h-full ${
                isNeubrutalism
                  ? "bg-[#FFFDF0] border-3 border-black border-dashed rounded-none text-black font-bold"
                  : "bg-gray-50/70 rounded-3xl border border-dashed border-sky-200/80 text-gray-500"
              }`}
            >
              <UserCheck
                className={`w-12 h-12 mx-auto mb-3 ${
                  isNeubrutalism ? "text-black stroke-[2.5]" : "text-sky-400"
                }`}
              />
              <h3
                className={`text-sm font-bold mb-1 ${
                  isNeubrutalism ? "font-black uppercase text-black" : "text-slate-800"
                }`}
              >
                No Pending Requests
              </h3>
              <p
                className={`text-xs max-w-xs mx-auto ${
                  isNeubrutalism ? "text-black/80 font-bold" : "text-slate-500"
                }`}
              >
                When friends send you a connection request, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {pendingRequests.map((req) => (
                  <motion.div
                    key={req._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
                      isNeubrutalism
                        ? "bg-white border-3 border-black shadow-[4px_4px_0_#000] rounded-none text-black"
                        : "bg-white/90 border border-sky-100 rounded-2xl shadow-xs hover:shadow-md hover:border-sky-200/80"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
                      <img
                        src={req.sender?.profilePic || "/avatar.png"}
                        alt={req.sender?.fullName}
                        className={`w-12 h-12 object-cover flex-shrink-0 ${
                          isNeubrutalism
                            ? "border-2 border-black rounded-none shadow-[2px_2px_0_#000]"
                            : "rounded-full ring-2 ring-sky-200"
                        }`}
                        onError={(e) => {
                          e.target.src = "/avatar.png";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm truncate ${
                            isNeubrutalism
                              ? "font-black text-black uppercase"
                              : "font-bold text-slate-900"
                          }`}
                        >
                          {req.sender?.fullName}
                        </p>
                        <p
                          className={`text-xs truncate ${
                            isNeubrutalism
                              ? "font-extrabold text-black/70"
                              : "font-semibold text-blue-600"
                          }`}
                        >
                          @{req.sender?.username || req.sender?.email?.split("@")[0]}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 font-medium">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <span>Ready to connect</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto flex-shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => acceptFriendRequest(req._id)}
                        className={`flex-1 sm:flex-initial py-2 px-4 text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isNeubrutalism
                            ? "bg-[#00E676] text-black border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-xs font-bold"
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Accept</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => declineFriendRequest(req._id)}
                        className={`flex-1 sm:flex-initial py-2 px-4 text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isNeubrutalism
                            ? "bg-[#FF007A] text-white border-2 border-black shadow-[2px_2px_0_#000] rounded-none"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                        }`}
                      >
                        <X className="w-4 h-4 stroke-[3]" />
                        <span>Decline</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div
          className={`px-5 sm:px-6 py-4 text-center flex-shrink-0 ${
            isNeubrutalism
              ? "bg-[#FFFDF0] border-t-3 border-black text-black font-extrabold text-[11px]"
              : "bg-white/60 backdrop-blur-md border-t border-slate-200/70 text-slate-500 font-medium text-[11px]"
          }`}
        >
          <p className="leading-normal">
            Accepting a request lets you send end-to-end encrypted direct messages.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PendingRequestsPanel;
