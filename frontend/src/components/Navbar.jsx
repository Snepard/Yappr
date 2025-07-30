import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <>
      <nav className="top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-indigo-500/30 shadow-2xl">
        {/* Animated shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent animate-pulse opacity-50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-black to-purple-500 rounded-full flex items-center justify-center text-white text-lg shadow-lg shadow-indigo-500/40 group-hover:shadow-indigo-500/60 transition-all duration-300 group-hover:scale-105 overflow-hidden">
                  {/* Replace this with your logo image */}
                  <img
                    src="/YapprIcon.png"
                    alt="YAPPR Logo"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full animate-ping opacity-20"></div>
              </div>
              <div className="hidden sm:block">
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">
                  YAPPR
                </h2>
                <span className="text-xs text-indigo-300/80 font-light">
                  Connect Beyond
                </span>
              </div>
            </Link>

            {authUser ? (
            /* Navigation Links & Logout */
            <div className="flex items-center space-x-8">
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  to={"/profile"}
                  className="relative text-white/80 hover:text-white font-medium py-2 px-4 rounded-full transition-all duration-300 hover:bg-indigo-500/20 hover:-translate-y-0.5 group"
                >
                  <span className="relative z-10">Profile</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                </Link>
              </div>

              <button
                className="relative group overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-red-500/25 hover:shadow-red-500/40 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 active:scale-95 transform-gpu"
                onClick={logout}
              >
                {/* Animated background layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"></div>
                
                {/* Glowing border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-400 via-pink-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10 scale-110"></div>

                <div className="relative flex items-center space-x-3 min-w-[100px] justify-center z-10">
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline font-semibold tracking-wide">Logout</span>
                  <span className="sm:hidden font-semibold">Out</span>
                </div>

                {/* Pulse animation on hover */}
                <div className="absolute inset-0 rounded-2xl bg-red-400 opacity-0 group-hover:opacity-20 group-hover:animate-ping"></div>
              </button>
            </div>
            ) : (
              <button
                className="relative group overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 active:scale-95 transform-gpu"
              >
                <Link to={"/login"}>
                {/* Animated background layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"></div>
                
                {/* Glowing border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10 scale-110"></div>

                <div className="relative flex items-center space-x-3 min-w-[100px] justify-center z-10">
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:-rotate-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M17 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zM6.707 7.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L5.414 11H13a1 1 0 100-2H5.414l1.293-1.293z" clipRule="evenodd" />
                  </svg>
                  
                  <span className="hidden sm:inline font-semibold tracking-wide">Login</span>
                  <span className="sm:hidden font-semibold">In</span>
                </div>

                {/* Pulse animation on hover */}
                <div className="absolute inset-0 rounded-2xl bg-emerald-400 opacity-0 group-hover:opacity-20 group-hover:animate-ping"></div>

                {/* Sparkle effects */}
                <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300 delay-100"></div>
                <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300 delay-200"></div>
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
