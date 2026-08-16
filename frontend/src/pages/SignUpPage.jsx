import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, AtSign } from 'lucide-react';
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import toast from 'react-hot-toast';

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: ''
  });

  const { signup, isSigningUp } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";
  const [focused, setFocused] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      signup(formData);
    }
  };

  const handleFocus = (field) => {
    setFocused(field);
  };

  const handleBlur = () => {
    setFocused('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {/* Form Container */}
          <div className={`transition-all duration-200 ${
            isNeubrutalism
              ? 'bg-white border-4 border-black p-8 sm:p-10 shadow-[8px_8px_0_#000] rounded-none text-black'
              : 'backdrop-blur-sm bg-gradient-to-br from-black/40 to-black/20 rounded-3xl shadow-2xl border border-white/20 p-10'
          }`}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mb-3">
                <h1 className={`text-3xl sm:text-4xl font-black mb-2 ${
                  isNeubrutalism ? 'text-black uppercase tracking-tight' : 'text-white tracking-wide'
                }`}>
                  CREATE ACCOUNT
                </h1>
                <div className={`w-32 h-1.5 mx-auto ${
                  isNeubrutalism ? 'bg-black' : 'bg-gradient-to-r from-slate-400 to-slate-600 rounded-full'
                }`} />
              </div>
              <p className={`text-sm font-bold ${
                isNeubrutalism ? 'text-black' : 'text-blue-100 font-light'
              }`}>
                Join YAPPR and start connecting!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className={`flex items-center text-xs font-black mb-1.5 tracking-wide ${
                  isNeubrutalism ? 'text-black uppercase' : 'text-white'
                }`}>
                  <User className={`mr-2 ${isNeubrutalism ? 'text-black' : 'text-blue-400'}`} size={16} />
                  FULL NAME
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 text-sm transition-all duration-150 ${
                    isNeubrutalism
                      ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] focus:shadow-[5px_5px_0_#000] focus:outline-none rounded-none font-bold placeholder:text-gray-500'
                      : 'bg-black/20 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400'
                  }`}
                  placeholder="Aryan Sharma"
                />
              </div>

              {/* Username */}
              <div>
                <label className={`flex items-center text-xs font-black mb-1.5 tracking-wide ${
                  isNeubrutalism ? 'text-black uppercase' : 'text-white'
                }`}>
                  <AtSign className={`mr-2 ${isNeubrutalism ? 'text-black' : 'text-blue-400'}`} size={16} />
                  USERNAME
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 text-sm transition-all duration-150 ${
                    isNeubrutalism
                      ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] focus:shadow-[5px_5px_0_#000] focus:outline-none rounded-none font-bold placeholder:text-gray-500'
                      : 'bg-black/20 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400'
                  }`}
                  placeholder="aryan_123"
                />
              </div>

              {/* Email */}
              <div>
                <label className={`flex items-center text-xs font-black mb-1.5 tracking-wide ${
                  isNeubrutalism ? 'text-black uppercase' : 'text-white'
                }`}>
                  <Mail className={`mr-2 ${isNeubrutalism ? 'text-black' : 'text-blue-400'}`} size={16} />
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 text-sm transition-all duration-150 ${
                    isNeubrutalism
                      ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] focus:shadow-[5px_5px_0_#000] focus:outline-none rounded-none font-bold placeholder:text-gray-500'
                      : 'bg-black/20 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400'
                  }`}
                  placeholder="aryan@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className={`flex items-center text-xs font-black mb-1.5 tracking-wide ${
                  isNeubrutalism ? 'text-black uppercase' : 'text-white'
                }`}>
                  <Lock className={`mr-2 ${isNeubrutalism ? 'text-black' : 'text-blue-400'}`} size={16} />
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pr-12 text-sm transition-all duration-150 ${
                      isNeubrutalism
                        ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] focus:shadow-[5px_5px_0_#000] focus:outline-none rounded-none font-bold placeholder:text-gray-500'
                        : 'bg-black/20 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400'
                    }`}
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer ${
                      isNeubrutalism ? 'text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSigningUp}
                className={`w-full py-3.5 text-base font-black tracking-wide transition-all cursor-pointer disabled:opacity-50 mt-2 ${
                  isNeubrutalism
                    ? 'bg-[#FFE600] text-black uppercase border-3 border-black shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#000] rounded-none'
                    : 'bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl shadow-2xl hover:from-slate-600 hover:to-slate-800 transform hover:scale-105'
                }`}
              > 
                {isSigningUp ? "Creating Account..." : "JOIN YAPPR"}
              </button>

              <div className="text-center pt-1">
                <p className={`text-xs sm:text-sm font-bold ${isNeubrutalism ? 'text-black' : 'text-blue-200/80'}`}>
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