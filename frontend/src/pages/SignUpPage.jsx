import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, AtSign, ShieldCheck, KeyRound, Info } from 'lucide-react';
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import toast from 'react-hot-toast';

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    pin: '',
    confirmPin: ''
  });

  const { signup, isSigningUp } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Restrict PIN inputs to digits only and max length 6
    if (name === 'pin' || name === 'confirmPin') {
      const sanitized = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({
        ...prev,
        [name]: sanitized
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error("Full name is required!");
      return false;
    }
    if (!formData.username.trim()) {
      toast.error("Username is required!");
      return false;
    }
    if (!/^[a-zA-Z0-9_.]+$/.test(formData.username.trim())) {
      toast.error("Username can only contain letters, numbers, underscores, and dots");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required!");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (!formData.pin || formData.pin.length !== 6) {
      toast.error("Please enter a 6-digit backup PIN");
      return false;
    }
    if (formData.pin !== formData.confirmPin) {
      toast.error("Backup PINs do not match!");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      signup(formData);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const togglePinVisibility = () => {
    setShowPin(!showPin);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden flex flex-col justify-between ${
      isNeubrutalism ? 'bg-[#FFFDF0] text-black' : 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white'
    }`}>
      {/* Background Grid */}
      {isNeubrutalism ? (
        <div 
          className="absolute inset-0 z-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, #FFFDF0 1px)`,
            backgroundSize: `32px 32px`
          }}
        />
      ) : (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-slate-950" />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Form Container */}
          <div className={`transition-all duration-200 ${
            isNeubrutalism
              ? 'bg-white border-4 border-black p-8 sm:p-10 shadow-[8px_8px_0_#000] rounded-none text-black'
              : 'backdrop-blur-md bg-gradient-to-br from-black/50 to-black/30 rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10'
          }`}>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mb-2">
                <h1 className={`text-3xl sm:text-4xl font-black mb-1.5 ${
                  isNeubrutalism ? 'text-black uppercase tracking-tight' : 'text-white tracking-wide'
                }`}>
                  CREATE ACCOUNT
                </h1>
                <div className={`w-28 h-1.5 mx-auto ${
                  isNeubrutalism ? 'bg-black' : 'bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full'
                }`} />
              </div>
              <p className={`text-xs sm:text-sm font-semibold ${
                isNeubrutalism ? 'text-black' : 'text-blue-100 font-light'
              }`}>
                Join YAPPR with Zero-Knowledge E2EE Protection!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className={`flex items-center text-xs font-black mb-1 tracking-wide ${
                  isNeubrutalism ? 'text-black uppercase' : 'text-slate-200'
                }`}>
                  <User className={`mr-2 ${isNeubrutalism ? 'text-black' : 'text-blue-400'}`} size={15} />
                  FULL NAME
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
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
                <label className={`flex items-center text-xs font-black mb-1 tracking-wide ${
                  isNeubrutalism ? 'text-black uppercase' : 'text-slate-200'
                }`}>
                  <AtSign className={`mr-2 ${isNeubrutalism ? 'text-black' : 'text-blue-400'}`} size={15} />
                  USERNAME
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
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
                <label className={`flex items-center text-xs font-black mb-1 tracking-wide ${
                  isNeubrutalism ? 'text-black uppercase' : 'text-slate-200'
                }`}>
                  <Mail className={`mr-2 ${isNeubrutalism ? 'text-black' : 'text-blue-400'}`} size={15} />
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
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
                <label className={`flex items-center text-xs font-black mb-1 tracking-wide ${
                  isNeubrutalism ? 'text-black uppercase' : 'text-slate-200'
                }`}>
                  <Lock className={`mr-2 ${isNeubrutalism ? 'text-black' : 'text-blue-400'}`} size={15} />
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 pr-12 text-sm transition-all duration-150 ${
                      isNeubrutalism
                        ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] focus:shadow-[5px_5px_0_#000] focus:outline-none rounded-none font-bold placeholder:text-gray-500'
                        : 'bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400'
                    }`}
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${
                      isNeubrutalism ? 'text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* 6-Digit Backup PIN Section */}
              <div className={`pt-2 p-3.5 rounded-2xl border ${
                isNeubrutalism
                  ? 'bg-[#E0F7FA] border-2 border-black shadow-[3px_3px_0_#000]'
                  : 'bg-blue-950/40 border-blue-500/30'
              }`}>
                <div className="flex items-start space-x-2 mb-2.5">
                  <ShieldCheck className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isNeubrutalism ? 'text-black' : 'text-sky-400'}`} />
                  <div>
                    <h3 className={`text-xs font-bold ${isNeubrutalism ? 'text-black uppercase' : 'text-sky-200'}`}>
                      6-Digit E2EE Backup PIN
                    </h3>
                    <p className={`text-[11px] leading-relaxed mt-0.5 ${isNeubrutalism ? 'text-black/80' : 'text-slate-300'}`}>
                      Your safety net to restore past encrypted chats if you ever forget your password.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isNeubrutalism ? 'text-black' : 'text-slate-300'}`}>
                      PIN (6 Digits)
                    </label>
                    <div className="relative">
                      <input
                        type={showPin ? "text" : "password"}
                        name="pin"
                        maxLength={6}
                        value={formData.pin}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-center text-sm tracking-widest font-mono font-bold transition-all ${
                          isNeubrutalism
                            ? 'bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] focus:outline-none'
                            : 'bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sky-400'
                        }`}
                        placeholder="••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isNeubrutalism ? 'text-black' : 'text-slate-300'}`}>
                      Confirm PIN
                    </label>
                    <div className="relative">
                      <input
                        type={showPin ? "text" : "password"}
                        name="confirmPin"
                        maxLength={6}
                        value={formData.confirmPin}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 text-center text-sm tracking-widest font-mono font-bold transition-all ${
                          isNeubrutalism
                            ? 'bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] focus:outline-none'
                            : 'bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-sky-400'
                        }`}
                        placeholder="••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-1.5 flex justify-end">
                  <button
                    type="button"
                    onClick={togglePinVisibility}
                    className={`text-[11px] font-semibold underline cursor-pointer ${
                      isNeubrutalism ? 'text-black' : 'text-sky-300 hover:text-sky-200'
                    }`}
                  >
                    {showPin ? "Hide PIN digits" : "Show PIN digits"}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSigningUp}
                className={`w-full py-3 text-sm sm:text-base font-black tracking-wide transition-all cursor-pointer disabled:opacity-50 mt-1 ${
                  isNeubrutalism
                    ? 'bg-[#FFE600] text-black uppercase border-3 border-black shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#000] rounded-none'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg hover:from-blue-500 hover:to-indigo-600 transform hover:scale-[1.02]'
                }`}
              > 
                {isSigningUp ? "Securing & Creating Account..." : "ENABLE E2EE & JOIN YAPPR"}
              </button>

              <div className="text-center pt-1">
                <p className={`text-xs font-bold ${isNeubrutalism ? 'text-black' : 'text-blue-200/80'}`}>
                  Already have an account?{' '}
                  <Link to="/login" className={`font-black underline ${isNeubrutalism ? 'text-[#FF007A]' : 'text-cyan-300'}`}>
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;