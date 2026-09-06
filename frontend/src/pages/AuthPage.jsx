import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Mail, Lock, AtSign, ShieldCheck, KeyRound, Info } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import toast from 'react-hot-toast';
import GradientWaves from '../components/GradientWaves';

const AuthPage = ({ defaultMode }) => {
  const [searchParams] = useSearchParams();
  const invitedBy = searchParams.get("ref");
  const location = useLocation();
  const navigate = useNavigate();

  // Mode: 'login' | 'signup' | 'forgot-password'
  const [mode, setMode] = useState(() => {
    if (defaultMode) return defaultMode;
    if (location.pathname === '/forgot-password') return 'forgot-password';
    return location.pathname === '/signup' || Boolean(invitedBy) ? 'signup' : 'login';
  });

  // Sync mode with route changes if any
  useEffect(() => {
    if (location.pathname === '/signup') {
      setMode('signup');
    } else if (location.pathname === '/login') {
      setMode('login');
    } else if (location.pathname === '/forgot-password') {
      setMode('forgot-password');
    }
  }, [location.pathname]);

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    let targetPath = '/login';
    if (newMode === 'signup') {
      targetPath = invitedBy ? `/signup?ref=${invitedBy}` : '/signup';
    } else if (newMode === 'forgot-password') {
      targetPath = '/forgot-password';
    }
    navigate(targetPath, { replace: true });
  };

  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";

  // --- Sign In State & Handlers ---
  const { login, isLoggingIn } = useAuthStore();
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    const isRemembered = localStorage.getItem('rememberMe') === 'true';
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (isRemembered && savedEmail) {
      setRememberMe(true);
      setLoginData(prev => ({ ...prev, email: savedEmail }));
    }
  }, []);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const validateLoginForm = () => {
    if (!loginData.email.trim()) {
      toast.error("Email is required!");
      return false;
    }
    if (!loginData.password) {
      toast.error("Password is required");
      return false;
    }
    return true;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (validateLoginForm()) {
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedEmail', loginData.email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedEmail');
      }
      login(loginData);
    }
  };

  // --- Forgot Password State & Handlers ---
  const { forgotPassword, isSendingReset } = useAuthStore();
  const [recoveryEmail, setRecoveryEmail] = useState('');

  const handleRecoverySubmit = (e) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      toast.error("Email is required!");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(recoveryEmail)) {
      toast.error("Invalid email format");
      return;
    }
    forgotPassword(recoveryEmail);
  };

  // --- Sign Up State & Handlers ---
  const { signup, isSigningUp } = useAuthStore();
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [signupData, setSignupData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    pin: '',
    confirmPin: ''
  });

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    if (name === 'pin' || name === 'confirmPin') {
      const sanitized = value.replace(/\D/g, '').slice(0, 6);
      setSignupData(prev => ({ ...prev, [name]: sanitized }));
      return;
    }
    setSignupData(prev => ({ ...prev, [name]: value }));
  };

  const validateSignupForm = () => {
    if (!signupData.fullName.trim()) {
      toast.error("Full name is required!");
      return false;
    }
    if (!signupData.username.trim()) {
      toast.error("Username is required!");
      return false;
    }
    if (!/^[a-zA-Z0-9_.]+$/.test(signupData.username.trim())) {
      toast.error("Username can only contain letters, numbers, underscores, and dots");
      return false;
    }
    if (!signupData.email.trim()) {
      toast.error("Email is required!");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (!signupData.password) {
      toast.error("Password is required");
      return false;
    }
    if (signupData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (!signupData.pin || signupData.pin.length !== 6) {
      toast.error("Please enter a 6-digit backup PIN");
      return false;
    }
    if (signupData.pin !== signupData.confirmPin) {
      toast.error("Backup PINs do not match!");
      return false;
    }
    return true;
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (validateSignupForm()) {
      signup(signupData);
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden flex flex-col justify-between ${
      isNeubrutalism ? 'bg-[#FFFDF0] text-black' : 'bg-[#030712] text-white'
    }`}>
      {/* Background (Persistently mounted, preventing shader reload lag) */}
      {isNeubrutalism ? (
        <div 
          className="absolute inset-0 z-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, #FFFDF0 1px)`,
            backgroundSize: `32px 32px`
          }}
        />
      ) : (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <GradientWaves
            horizonColor="#000dff"
            waveColor="#51d3fa"
            crestColor="#a0f3fa"
            speed={0.4}
            amplitude={2.5}
            waveScale={0.6}
            waveRatio={0.9}
            swell={35}
            turbulence={20}
            tilt={1.11}
            zoom={1}
            height={5.5}
            fogDepth={15}
            detail="medium"
            brightness={1}
            opacity={1}
            mouseInteraction
            parallaxStrength={0.5}
            grain
            grainIntensity={0.05}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-slate-950/60 pointer-events-none" />
        </div>
      )}

      {/* Main Responsive Auth Card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8 sm:py-12">
        <motion.div 
          layout
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={`w-full transition-all duration-300 ${
            mode === 'signup' ? 'max-w-3xl lg:max-w-4xl' : 'max-w-md'
          }`}
        >
          {/* Card Container */}
          <div className={`transition-all duration-200 ${
            isNeubrutalism
              ? 'bg-white border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0_#000] rounded-none text-black'
              : 'backdrop-blur-md bg-gradient-to-br from-black/50 to-black/30 rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-10'
          }`}>
            {/* Seamless Animated Forms */}
            <AnimatePresence mode="wait" initial={false}>
              {mode === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  {/* Sign In Header */}
                  <div className="text-center mb-6 sm:mb-8">
                    <h1 className={`text-3xl sm:text-4xl font-black mb-2 ${
                      isNeubrutalism ? 'text-black uppercase tracking-tight' : 'text-white tracking-wide'
                    }`}>
                      WELCOME BACK
                    </h1>
                    <div className={`w-28 h-1.5 mx-auto mb-2 ${
                      isNeubrutalism ? 'bg-black' : 'bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full'
                    }`} />
                    <p className={`text-xs sm:text-sm font-semibold ${
                      isNeubrutalism ? 'text-black font-bold' : 'text-blue-100 font-light'
                    }`}>
                      Jump back to your convos!!
                    </p>
                  </div>

                  {/* Sign In Form */}
                  <form onSubmit={handleLoginSubmit} className="space-y-5">
                    {/* Email / Username */}
                    <div>
                      <label className={`flex items-center text-xs font-black mb-1.5 tracking-wide ${
                        isNeubrutalism ? 'text-black uppercase' : 'text-slate-200'
                      }`}>
                        <Mail className={`mr-2 ${isNeubrutalism ? 'text-black' : 'text-blue-400'}`} size={15} />
                        EMAIL OR USERNAME
                      </label>
                      <input
                        type="text"
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        className={`w-full px-4 py-2.5 text-sm transition-all duration-150 ${
                          isNeubrutalism
                            ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] focus:shadow-[5px_5px_0_#000] focus:outline-none rounded-none font-bold placeholder:text-gray-500'
                            : 'bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400'
                        }`}
                        placeholder="aryan@example.com or aryan"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className={`flex items-center text-xs font-black mb-1.5 tracking-wide ${
                        isNeubrutalism ? 'text-black uppercase' : 'text-slate-200'
                      }`}>
                        <Lock className={`mr-2 ${isNeubrutalism ? 'text-black' : 'text-blue-400'}`} size={15} />
                        PASSWORD
                      </label>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          name="password"
                          value={loginData.password}
                          onChange={handleLoginChange}
                          className={`w-full px-4 py-2.5 pr-12 text-sm transition-all duration-150 ${
                            isNeubrutalism
                              ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] focus:shadow-[5px_5px_0_#000] focus:outline-none rounded-none font-bold placeholder:text-gray-500'
                              : 'bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400'
                          }`}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${
                            isNeubrutalism ? 'text-black' : 'text-white/60 hover:text-white'
                          }`}
                        >
                          {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className={`w-4.5 h-4.5 flex items-center justify-center transition-all ${
                          isNeubrutalism
                            ? 'border-2 border-black bg-white peer-checked:bg-[#FFE600] rounded-none shadow-[1px_1px_0_#000]'
                            : 'bg-black/30 border-2 border-white/30 rounded-md peer-checked:bg-blue-500'
                        }`}>
                          {rememberMe && (
                            <svg className={`w-3 h-3 stroke-current ${isNeubrutalism ? 'text-black' : 'text-white'}`} viewBox="0 0 24 24" fill="none" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                        <span className={isNeubrutalism ? 'text-black font-extrabold' : 'text-white/80'}>
                          Remember me
                        </span>
                      </label>
                      <button 
                        type="button"
                        onClick={() => switchMode('forgot-password')}
                        className={`text-xs font-extrabold cursor-pointer hover:underline ${
                          isNeubrutalism ? 'text-black hover:text-[#FF007A]' : 'text-blue-400 hover:text-blue-300'
                        }`}>
                        Forgot Password?
                      </button>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className={`w-full py-3.5 text-sm sm:text-base font-black tracking-wide transition-all cursor-pointer disabled:opacity-50 mt-1 ${
                        isNeubrutalism
                          ? 'bg-[#FFE600] text-black uppercase border-3 border-black shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#000] rounded-none'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg hover:from-blue-500 hover:to-indigo-600 transform hover:scale-[1.01]'
                      }`}
                    > 
                      {isLoggingIn ? "Signing In..." : "START YAPPIN'"}
                    </button>

                    {/* Switch Link */}
                    <div className="text-center pt-2">
                      <p className={`text-xs font-bold ${isNeubrutalism ? 'text-black' : 'text-blue-200/80'}`}>
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => switchMode('signup')}
                          className={`font-black underline cursor-pointer ${isNeubrutalism ? 'text-[#FF007A]' : 'text-cyan-300'}`}
                        >
                          Create Account
                        </button>
                      </p>
                    </div>
                  </form>
                </motion.div>
              ) : mode === 'signup' ? (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  {/* Sign Up Header */}
                  <div className="text-center mb-6">
                    <h1 className={`text-3xl sm:text-4xl font-black mb-1.5 ${
                      isNeubrutalism ? 'text-black uppercase tracking-tight' : 'text-white tracking-wide'
                    }`}>
                      CREATE ACCOUNT
                    </h1>
                    <div className={`w-28 h-1.5 mx-auto mb-2 ${
                      isNeubrutalism ? 'bg-black' : 'bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full'
                    }`} />
                    <p className={`text-xs sm:text-sm font-semibold ${
                      isNeubrutalism ? 'text-black' : 'text-blue-100 font-light'
                    }`}>
                      Join YAPPR
                    </p>
                  </div>

                  {invitedBy && (
                    <div
                      className={`mb-5 p-3.5 flex items-center gap-3 transition-all ${
                        isNeubrutalism
                          ? 'bg-[#00E676] border-3 border-black shadow-[3px_3px_0_#000] rounded-none text-black'
                          : 'bg-blue-500/15 border border-blue-400/30 text-sky-200 backdrop-blur-md rounded-2xl'
                      }`}
                    >
                      <div
                        className={`p-2 shrink-0 ${
                          isNeubrutalism ? 'bg-black text-[#00E676] border border-black' : 'bg-blue-400/20 text-sky-300 rounded-xl'
                        }`}
                      >
                        <User className="w-4 h-4" />
                      </div>
                      <div className="text-xs min-w-0 flex-1">
                        <p className={`font-black ${isNeubrutalism ? 'text-black uppercase' : 'text-white'}`}>
                          Invited by @{invitedBy}
                        </p>
                        <p className={`text-[11px] ${isNeubrutalism ? 'text-black/80 font-bold' : 'text-sky-300/80'}`}>
                          Create your account to connect and chat on YAPPR.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sign Up Form (Credentials on Left, E2EE Backup PIN on Right) */}
                  <form onSubmit={handleSignupSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                      {/* Left Side: Account Fields */}
                      <div className="space-y-4">
                        {/* Full Name */}
                        <div>
                          <label className={`flex items-center text-xs font-black mb-1.5 tracking-wide ${
                            isNeubrutalism ? 'text-black uppercase' : 'text-slate-200'
                          }`}>
                            <User className={`mr-2 ${isNeubrutalism ? 'text-black' : 'text-blue-400'}`} size={15} />
                            FULL NAME
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={signupData.fullName}
                            onChange={handleSignupChange}
                            className={`w-full px-4 py-2.5 text-sm transition-all duration-150 ${
                              isNeubrutalism
                                ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] focus:shadow-[5px_5px_0_#000] focus:outline-none rounded-none font-bold placeholder:text-gray-500'
                                : 'bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400'
                            }`}
                            placeholder="Aryan Singh"
                          />
                        </div>

                        {/* Username */}
                        <div>
                          <label className={`flex items-center text-xs font-black mb-1.5 tracking-wide ${
                            isNeubrutalism ? 'text-black uppercase' : 'text-slate-200'
                          }`}>
                            <AtSign className={`mr-2 ${isNeubrutalism ? 'text-black' : 'text-blue-400'}`} size={15} />
                            USERNAME
                          </label>
                          <input
                            type="text"
                            name="username"
                            value={signupData.username}
                            onChange={handleSignupChange}
                            className={`w-full px-4 py-2.5 text-sm transition-all duration-150 ${
                              isNeubrutalism
                                ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] focus:shadow-[5px_5px_0_#000] focus:outline-none rounded-none font-bold placeholder:text-gray-500'
                                : 'bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400'
                            }`}
                            placeholder="aryan_123"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className={`flex items-center text-xs font-black mb-1.5 tracking-wide ${
                            isNeubrutalism ? 'text-black uppercase' : 'text-slate-200'
                          }`}>
                            <Mail className={`mr-2 ${isNeubrutalism ? 'text-black' : 'text-blue-400'}`} size={15} />
                            EMAIL ADDRESS
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={signupData.email}
                            onChange={handleSignupChange}
                            className={`w-full px-4 py-2.5 text-sm transition-all duration-150 ${
                              isNeubrutalism
                                ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] focus:shadow-[5px_5px_0_#000] focus:outline-none rounded-none font-bold placeholder:text-gray-500'
                                : 'bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400'
                            }`}
                            placeholder="aryan@example.com"
                          />
                        </div>

                        {/* Password */}
                        <div>
                          <label className={`flex items-center text-xs font-black mb-1.5 tracking-wide ${
                            isNeubrutalism ? 'text-black uppercase' : 'text-slate-200'
                          }`}>
                            <Lock className={`mr-2 ${isNeubrutalism ? 'text-black' : 'text-blue-400'}`} size={15} />
                            PASSWORD
                          </label>
                          <div className="relative">
                            <input
                              type={showSignupPassword ? "text" : "password"}
                              name="password"
                              value={signupData.password}
                              onChange={handleSignupChange}
                              className={`w-full px-4 py-2.5 pr-12 text-sm transition-all duration-150 ${
                                isNeubrutalism
                                  ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] focus:shadow-[5px_5px_0_#000] focus:outline-none rounded-none font-bold placeholder:text-gray-500'
                                  : 'bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400'
                              }`}
                              placeholder="At least 6 characters"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSignupPassword(!showSignupPassword)}
                              className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${
                                isNeubrutalism ? 'text-black' : 'text-white/60 hover:text-white'
                              }`}
                            >
                              {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: 6-Digit E2EE Backup PIN Section */}
                      <div className="flex flex-col h-full">
                        <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between h-full ${
                          isNeubrutalism
                            ? 'bg-[#E0F7FA] border-3 border-black shadow-[4px_4px_0_#000] rounded-none'
                            : 'bg-blue-950/40 border-blue-500/30 backdrop-blur-md'
                        }`}>
                          <div>
                            {/* Section Header */}
                            <div className="flex items-start space-x-3 mb-4">
                              <div className={`p-2 shrink-0 ${
                                isNeubrutalism 
                                  ? 'bg-black text-[#E0F7FA] border-2 border-black shadow-[2px_2px_0_#000]' 
                                  : 'bg-sky-400/20 text-sky-300 rounded-xl border border-sky-400/30'
                              }`}>
                                <ShieldCheck className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className={`text-sm font-black ${isNeubrutalism ? 'text-black uppercase' : 'text-sky-200'}`}>
                                  6-Digit E2EE Backup PIN
                                </h3>
                                <p className={`text-[11px] leading-relaxed mt-1 ${isNeubrutalism ? 'text-black/80 font-medium' : 'text-slate-300'}`}>
                                  Your safety net to restore past encrypted chats if you ever forget your password.
                                </p>
                              </div>
                            </div>

                            {/* PIN Inputs */}
                            <div className="space-y-3">
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className={`flex items-center gap-1.5 text-xs font-bold ${isNeubrutalism ? 'text-black uppercase' : 'text-slate-200'}`}>
                                    <KeyRound className={`w-3.5 h-3.5 ${isNeubrutalism ? 'text-black' : 'text-sky-400'}`} />
                                    BACKUP PIN (6 DIGITS)
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => setShowPin(!showPin)}
                                    className={`text-[11px] font-semibold underline cursor-pointer ${
                                      isNeubrutalism ? 'text-black' : 'text-sky-300 hover:text-sky-200'
                                    }`}
                                  >
                                    {showPin ? "Hide digits" : "Show digits"}
                                  </button>
                                </div>
                                <input
                                  type={showPin ? "text" : "password"}
                                  name="pin"
                                  maxLength={6}
                                  value={signupData.pin}
                                  onChange={handleSignupChange}
                                  className={`w-full px-4 py-2.5 text-center text-base tracking-[0.35em] font-mono font-bold transition-all duration-150 ${
                                    isNeubrutalism
                                      ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] focus:shadow-[5px_5px_0_#000] focus:outline-none rounded-none'
                                      : 'bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400'
                                  }`}
                                  placeholder="••••••"
                                />
                              </div>

                              <div>
                                <label className={`block text-xs font-bold mb-1.5 ${isNeubrutalism ? 'text-black uppercase' : 'text-slate-200'}`}>
                                  CONFIRM BACKUP PIN
                                </label>
                                <input
                                  type={showPin ? "text" : "password"}
                                  name="confirmPin"
                                  maxLength={6}
                                  value={signupData.confirmPin}
                                  onChange={handleSignupChange}
                                  className={`w-full px-4 py-2.5 text-center text-base tracking-[0.35em] font-mono font-bold transition-all duration-150 ${
                                    isNeubrutalism
                                      ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] focus:shadow-[5px_5px_0_#000] focus:outline-none rounded-none'
                                      : 'bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400'
                                  }`}
                                  placeholder="••••••"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Notice / Security Info Box */}
                          <div className={`mt-4 p-3 rounded-xl border flex items-start gap-2.5 ${
                            isNeubrutalism
                              ? 'bg-white/80 border-2 border-black text-black'
                              : 'bg-black/30 border-white/10 text-slate-300'
                          }`}>
                            <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isNeubrutalism ? 'text-black' : 'text-sky-400'}`} />
                            <p className="text-[11px] leading-relaxed">
                              Never share your PIN. It encrypts your local keys and cannot be recovered by YAPPR servers if forgotten.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button & Links */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSigningUp}
                        className={`w-full py-3.5 text-sm sm:text-base font-black tracking-wide transition-all cursor-pointer disabled:opacity-50 ${
                          isNeubrutalism
                            ? 'bg-[#FFE600] text-black uppercase border-3 border-black shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#000] rounded-none'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg hover:from-blue-500 hover:to-indigo-600 transform hover:scale-[1.01]'
                        }`}
                      > 
                        {isSigningUp ? "Creating Account..." : "JOIN YAPPR"}
                      </button>

                      <div className="text-center pt-3">
                        <p className={`text-xs font-bold ${isNeubrutalism ? 'text-black' : 'text-blue-200/80'}`}>
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => switchMode('login')}
                            className={`font-black underline cursor-pointer ${isNeubrutalism ? 'text-[#FF007A]' : 'text-cyan-300'}`}
                          >
                            Sign In
                          </button>
                        </p>
                      </div>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="forgot-password"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  {/* Recovery Header */}
                  <div className="text-center mb-6 sm:mb-8">
                    <h1 className={`text-3xl sm:text-4xl font-black mb-2 ${
                      isNeubrutalism ? 'text-black uppercase tracking-tight' : 'text-white tracking-wide'
                    }`}>
                      RECOVERY
                    </h1>
                    <div className={`w-28 h-1.5 mx-auto mb-2 ${
                      isNeubrutalism ? 'bg-black' : 'bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full'
                    }`} />
                    <p className={`text-xs sm:text-sm font-semibold ${
                      isNeubrutalism ? 'text-black font-bold' : 'text-blue-100 font-light'
                    }`}>
                      Get back to yappin'
                    </p>
                  </div>

                  {/* Recovery Form */}
                  <form onSubmit={handleRecoverySubmit} className="space-y-5">
                    <div>
                      <label className={`flex items-center text-xs font-black mb-1.5 tracking-wide ${
                        isNeubrutalism ? 'text-black uppercase' : 'text-slate-200'
                      }`}>
                        <Mail className={`mr-2 ${isNeubrutalism ? 'text-black' : 'text-blue-400'}`} size={15} />
                        EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        name="recoveryEmail"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className={`w-full px-4 py-2.5 text-sm transition-all duration-150 ${
                          isNeubrutalism
                            ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] focus:shadow-[5px_5px_0_#000] focus:outline-none rounded-none font-bold placeholder:text-gray-500'
                            : 'bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400'
                        }`}
                        placeholder="aryan@example.com"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingReset}
                      className={`w-full py-3.5 text-sm sm:text-base font-black tracking-wide transition-all cursor-pointer disabled:opacity-50 mt-1 ${
                        isNeubrutalism
                          ? 'bg-[#FFE600] text-black uppercase border-3 border-black shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#000] rounded-none'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg hover:from-blue-500 hover:to-indigo-600 transform hover:scale-[1.01]'
                      }`}
                    > 
                      {isSendingReset ? "Sending Reset Link..." : "SEND RESET LINK"}
                    </button>

                    <div className="text-center pt-2">
                      <p className={`text-xs font-bold ${isNeubrutalism ? 'text-black' : 'text-blue-200/80'}`}>
                        Remember your password?{' '}
                        <button
                          type="button"
                          onClick={() => switchMode('login')}
                          className={`font-black underline cursor-pointer ${isNeubrutalism ? 'text-[#FF007A]' : 'text-cyan-300'}`}
                        >
                          Sign In
                        </button>
                      </p>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
