import React from "react";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";
import { confirmLogout } from "../lib/confirmToast";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const setIsInviteOpen = useChatStore((state) => state.setIsInviteOpen);
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";

  return (
    <>
      <nav className={`top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isNeubrutalism 
          ? 'bg-[#FFE600] border-b-4 border-black text-black shadow-[0_4px_0_#000000]'
          : 'bg-slate-900/95 backdrop-blur-xl border-b border-blue-500/30 shadow-2xl'
      }`}>
        {/* Animated shimmer effect in default mode */}
        {!isNeubrutalism && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-pulse opacity-50"></div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="relative">
                <div className={`w-10 h-10 flex items-center justify-center transition-all duration-200 overflow-hidden ${
                  isNeubrutalism
                    ? 'bg-black border-2 border-black rounded-none shadow-[2px_2px_0_#000]'
                    : 'bg-gradient-to-br from-slate-900 to-blue-600 rounded-full text-white shadow-lg shadow-blue-500/40 group-hover:scale-105'
                }`}>
                  <img
                    src="/YapprIcon.png"
                    alt="YAPPR Logo"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                {!isNeubrutalism && (
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full animate-ping opacity-20"></div>
                )}
              </div>
              <div className="hidden sm:block">
                <h2 className={`text-xl font-black ${
                  isNeubrutalism ? 'text-black uppercase tracking-tight' : 'text-white bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text font-bold'
                }`}>
                  YAPPR
                </h2>
                <span className={`text-xs ${isNeubrutalism ? 'text-black font-extrabold uppercase' : 'text-sky-300/80 font-light'}`}>
                  Connect Beyond
                </span>
              </div>
            </Link>

            {authUser ? (
            /* Navigation Links & Logout */
            <div className="flex items-center space-x-6 sm:space-x-8">
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className={`flex items-center gap-1.5 transition-all cursor-pointer ${
                    isNeubrutalism
                      ? 'bg-[#00E5FF] text-black font-extrabold px-4 py-2 border-3 border-black shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000] active:translate-x-0.5 active:translate-y-0.5'
                      : 'relative text-white/80 hover:text-white font-medium py-2 px-4 rounded-full hover:bg-blue-500/20 hover:-translate-y-0.5'
                  }`}
                >
                  <UserPlus className={`w-4 h-4 ${isNeubrutalism ? 'text-black' : 'text-cyan-400'}`} />
                  <span className="relative z-10">Invite</span>
                </button>

                <Link
                  to={"/profile"}
                  className={`transition-all ${
                    isNeubrutalism
                      ? 'bg-white text-black font-extrabold px-4 py-2 border-3 border-black shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000]'
                      : 'relative text-white/80 hover:text-white font-medium py-2 px-4 rounded-full hover:bg-blue-500/20 hover:-translate-y-0.5'
                  }`}
                >
                  <span className="relative z-10">Profile</span>
                </Link>
              </div>

              <button
                className={`transition-all cursor-pointer ${
                  isNeubrutalism
                    ? 'bg-[#FF007A] text-white font-black py-2.5 px-5 border-3 border-black shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#000]'
                    : 'relative group overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white font-bold py-3 px-6 rounded-2xl shadow-xl shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-1 active:translate-y-0 active:scale-95'
                }`}
                onClick={async () => {
                  const confirmed = await confirmLogout();
                  if (confirmed) logout();
                }}
              >
                {!isNeubrutalism && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"></div>
                  </>
                )}

                <div className="relative flex items-center space-x-2 justify-center z-10">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline font-black tracking-wide">Logout</span>
                  <span className="sm:hidden font-black">Out</span>
                </div>
              </button>
            </div>
            ) : (
              <button
                className={`transition-all cursor-pointer ${
                  isNeubrutalism
                    ? 'bg-[#00E676] text-black font-black py-2.5 px-6 border-3 border-black shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] active:translate-x-1 active:translate-y-1'
                    : 'relative group overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 text-white font-bold py-3 px-6 rounded-2xl shadow-xl shadow-emerald-500/25 hover:-translate-y-1 active:scale-95'
                }`}
              >
                <Link to={"/login"} className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M17 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zM6.707 7.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L5.414 11H13a1 1 0 100-2H5.414l1.293-1.293z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline font-black tracking-wide">Login</span>
                  <span className="sm:hidden font-black">In</span>
                </Link>
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
