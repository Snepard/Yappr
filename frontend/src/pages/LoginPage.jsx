import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import toast from 'react-hot-toast';

const SigninPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [focused, setFocused] = useState('');
  const { login, isLoggingIn } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";
  const navigate = useNavigate();

  useEffect(() => {
    const isRemembered = localStorage.getItem('rememberMe') === 'true';
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (isRemembered && savedEmail) {
      setRememberMe(true);
      setFormData(prev => ({ ...prev, email: savedEmail }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
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
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedEmail');
      }

      login(formData);
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
            <div className="text-center mb-8 sm:mb-10">
              <div className="mb-4">
                <h1 className={`text-3xl sm:text-4xl font-black mb-2 ${
                  isNeubrutalism ? 'text-black uppercase tracking-tight' : 'text-white tracking-wide'
                }`}>
                  WELCOME BACK
                </h1>
                <div className={`w-32 h-1.5 mx-auto ${
                  isNeubrutalism ? 'bg-black' : 'bg-gradient-to-r from-slate-400 to-slate-600 rounded-full'
                }`} />
              </div>
              <p className={`text-sm sm:text-base font-bold ${
                isNeubrutalism ? 'text-black' : 'text-blue-100 font-light'
              }`}>
                Jump back to your convos!!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Email */}
              <div className="relative">
                <label className={`flex items-center text-sm font-black mb-2 tracking-wide ${
                  isNeubrutalism ? 'text-black uppercase' : 'text-white'
                }`}>
                  <Mail className={`mr-2 ${isNeubrutalism ? 'text-black' : 'text-blue-400'}`} size={16} />
                  EMAIL OR USERNAME
                </label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  className={`w-full px-5 py-3.5 text-sm transition-all duration-150 ${
                    isNeubrutalism
                      ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] focus:shadow-[5px_5px_0_#000] focus:outline-none rounded-none font-bold placeholder:text-gray-500'
                      : 'bg-black/20 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400'
                  }`}
                  placeholder="aryan@example.com or aryan"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label className={`flex items-center text-sm font-black mb-2 tracking-wide ${
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
                    onFocus={() => handleFocus('password')}
                    onBlur={handleBlur}
                    className={`w-full px-5 py-3.5 pr-14 text-sm transition-all duration-150 ${
                      isNeubrutalism
                        ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] focus:shadow-[5px_5px_0_#000] focus:outline-none rounded-none font-bold placeholder:text-gray-500'
                        : 'bg-black/20 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer ${
                      isNeubrutalism ? 'text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2.5 text-sm font-bold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-5 h-5 flex items-center justify-center transition-all ${
                    isNeubrutalism
                      ? 'border-2 border-black bg-white peer-checked:bg-[#FFE600] rounded-none shadow-[1px_1px_0_#000]'
                      : 'bg-black/30 border-2 border-white/30 rounded-md peer-checked:bg-blue-500'
                  }`}>
                    {rememberMe && (
                      <svg className={`w-3.5 h-3.5 stroke-current ${isNeubrutalism ? 'text-black' : 'text-white'}`} viewBox="0 0 24 24" fill="none" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
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
                  onClick={() => navigate('/forgot-password')}
                  className={`text-sm font-extrabold cursor-pointer hover:underline ${
                    isNeubrutalism ? 'text-black hover:text-[#FF007A]' : 'text-blue-400 hover:text-blue-300'
                  }`}>
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className={`w-full py-4 text-base font-black tracking-wide transition-all cursor-pointer disabled:opacity-50 ${
                  isNeubrutalism
                    ? 'bg-[#FFE600] text-black uppercase border-3 border-black shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#000] rounded-none'
                    : 'bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl shadow-2xl hover:from-slate-600 hover:to-slate-800 transform hover:scale-105'
                }`}
              > 
                {isLoggingIn ? "Signing In..." : "START YAPPIN'"}
              </button>

              <div className="text-center pt-2">
                <p className={`text-xs sm:text-sm font-bold ${isNeubrutalism ? 'text-black' : 'text-blue-200/80'}`}>
                  Don't have an account?{' '}
                  <Link to="/signup" className={`font-black underline ${isNeubrutalism ? 'text-[#FF007A]' : 'text-cyan-300'}`}>
                    Create Account
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

export default SigninPage;