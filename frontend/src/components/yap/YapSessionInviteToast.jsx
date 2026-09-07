import React from "react";
import toast from "react-hot-toast";
import { Coffee, Check, X } from "lucide-react";
import { useThemeStore } from "../../store/useThemeStore";

export const showYapInviteToast = ({
  sessionId,
  sessionCode,
  inviterName,
  inviterProfilePic,
  onAccept,
}) => {
  const isNeubrutalism = useThemeStore.getState().theme === "neubrutalism";

  toast.custom(
    (t) => (
      <div
        className={`max-w-md w-full pointer-events-auto flex flex-col p-4 transition-all duration-200 ${
          t.visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95"
        } ${
          isNeubrutalism
            ? "bg-[#FFE600] border-4 border-black shadow-[5px_5px_0_#000] text-black rounded-none"
            : "bg-[#101622] text-slate-100 border border-orange-500/40 shadow-xl rounded-xl"
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Inviter Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={inviterProfilePic || "/avatar.png"}
              alt={inviterName}
              className={`w-11 h-11 object-cover ${
                isNeubrutalism ? "border-2 border-black rounded-none" : "rounded-lg border border-slate-700"
              }`}
            />
            <div
              className={`absolute -bottom-1 -right-1 p-0.5 flex items-center justify-center ${
                isNeubrutalism
                  ? "bg-[#FF007A] text-white border border-black rounded-none"
                  : "bg-orange-500 text-white rounded-md"
              }`}
            >
              <Coffee className="w-3 h-3 stroke-[2.5]" />
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase px-1.5 py-0.5 ${
                  isNeubrutalism
                    ? "bg-black text-white rounded-none"
                    : "bg-orange-500/15 text-orange-400 rounded-md"
                }`}
              >
                Tea Time
              </span>
              <span className={`text-xs font-mono font-bold ${isNeubrutalism ? "text-black" : "text-orange-400"}`}>
                #{sessionCode}
              </span>
            </div>

            <h4 className={`text-sm font-semibold mt-1 truncate ${isNeubrutalism ? "text-black font-black" : "text-white"}`}>
              {inviterName} invited you to Tea Time
            </h4>
            <p className={`text-xs mt-0.5 ${isNeubrutalism ? "text-black/80 font-bold" : "text-slate-400"}`}>
              Messages automatically delete when everyone leaves.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 pt-2.5 border-t flex items-center justify-end gap-2 border-slate-800">
          <button
            onClick={() => toast.dismiss(t.id)}
            className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isNeubrutalism
                ? "bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 rounded-none"
                : "text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            }`}
          >
            <X className="w-3.5 h-3.5" />
            <span>Decline</span>
          </button>

          <button
            onClick={() => {
              toast.dismiss(t.id);
              onAccept(sessionCode);
            }}
            className={`px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isNeubrutalism
                ? "bg-[#00E5FF] text-black border-2 border-black shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 rounded-none uppercase"
                : "bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm"
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Join Chat</span>
          </button>
        </div>
      </div>
    ),
    { duration: 15000, id: `yap-invite-${sessionId}` }
  );
};
