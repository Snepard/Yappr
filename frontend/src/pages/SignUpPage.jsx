import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, AtSign } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';
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
  const [focused, setFocused] = useState('');

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
    
    if (isValid) {signup(formData)};
  };

  const handleFocus = (fieldName) => {
    setFocused(fieldName);
  };

  const handleBlur = () => {
    setFocused('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center transform-gpu">
      {/* Video Background Container */}
      <div className="absolute inset-0 w-full h-full transform-gpu">
        <video 
          className="w-full h-full object-cover transform-gpu"
          autoPlay 
          loop 
          muted 
          playsInline
          preload="auto"
        >
          <source src="\authBG.mp4" type="video/mp4" />
          {/* Fallback gradient for browsers that don't support video */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
        </video>
        
        {/* Dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-2xl px-4 py-4 transform-gpu">
        {/* Form Container with Enhanced Blur for Dark Background */}
        <div className="backdrop-blur-sm bg-gradient-to-br from-black/40 to-black/20 rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 transition-all duration-500 transform-gpu">
          {/* Header inside container */}
          <div className="text-center mb-6">
            <div className="mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-wide">
                CREATE ACCOUNT
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-slate-400 to-slate-600 mx-auto rounded-full" />
            </div>
            <p className="text-blue-100 text-sm sm:text-base font-light tracking-wide">
              Start chatting with the universe
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="relative">
                <label className="flex items-center text-white text-xs sm:text-sm font-semibold mb-1.5 tracking-wide">
                  <User className="mr-2 text-blue-400" size={15} />
                  FULL NAME
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('fullName')}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2.5 bg-black/20 border-2 border-white/20 rounded-xl text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400/50 transition-all duration-300 hover:bg-black/30 hover:border-white/30"
                  placeholder="Aryan Singh"
                />
                {focused === 'fullName' && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/5 to-cyan-400/5 pointer-events-none" />
                )}
              </div>

              {/* Username */}
              <div className="relative">
                <label className="flex items-center text-white text-xs sm:text-sm font-semibold mb-1.5 tracking-wide">
                  <AtSign className="mr-2 text-blue-400" size={15} />
                  USERNAME
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('username')}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2.5 bg-black/20 border-2 border-white/20 rounded-xl text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400/50 transition-all duration-300 hover:bg-black/30 hover:border-white/30"
                  placeholder="aryansingh123"
                />
                {focused === 'username' && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/5 to-cyan-400/5 pointer-events-none" />
                )}
              </div>

              {/* Email */}
              <div className="relative">
                <label className="flex items-center text-white text-xs sm:text-sm font-semibold mb-1.5 tracking-wide">
                  <Mail className="mr-2 text-blue-400" size={15} />
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2.5 bg-black/20 border-2 border-white/20 rounded-xl text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400/50 transition-all duration-300 hover:bg-black/30 hover:border-white/30"
                  placeholder="aryan@example.com"
                />
                {focused === 'email' && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/5 to-cyan-400/5 pointer-events-none" />
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <label className="flex items-center text-white text-xs sm:text-sm font-semibold mb-1.5 tracking-wide">
                  <Lock className="mr-2 text-blue-400" size={15} />
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={handleBlur}
                    className="w-full px-4 py-2.5 pr-12 bg-black/20 border-2 border-white/20 rounded-xl text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400/50 transition-all duration-300 hover:bg-black/30 hover:border-white/30"
                    placeholder="Create secret key"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-300 focus:outline-none focus:text-blue-400 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {focused === 'password' && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/10 to-cyan-400/10 pointer-events-none" />
                )}
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 mt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white font-bold text-base sm:text-lg rounded-xl shadow-2xl hover:from-slate-600 hover:to-slate-800 transform hover:scale-[1.01] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-slate-400/50 active:scale-95 relative overflow-hidden group cursor-pointer"
                  disabled={isSigningUp}
                > 
                  {isSigningUp ? (
                    <span className="relative z-10 tracking-wide">Loading...</span>
                  ) : (
                    <span className="relative z-10 tracking-wide">START YAPPIN'</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-500 to-slate-700 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </button>
              </div>
            </div>
          </form>

          {/* Sign In Option */}
          <div className="mt-5 text-center">
            <p className="text-white/80 text-sm sm:text-base">
              Already yappin' with us?{' '}
              <button className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300 hover:underline decoration-2 underline-offset-4 cursor-pointer"
                onClick={() => navigate('/login')}>
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;