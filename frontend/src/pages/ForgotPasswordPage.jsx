import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useAuthStore } from '../store/useAuthStore';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState('');
  
  const { forgotPassword, isSendingReset } = useAuthStore();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  const validateForm = () => {
    if (!email.trim()) {
      alert("Email is required!");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Invalid email format");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if(isValid) { forgotPassword(email) };
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background Container */}
      <div className="absolute inset-0 w-full h-full">
        <video 
          className="w-full h-full object-cover"
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src="\authBG.mp4" type="video/mp4" />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {/* Form Container with Enhanced Blur for Dark Background */}
          <div className="backdrop-blur-sm bg-gradient-to-br from-black/40 to-black/20 rounded-3xl shadow-2xl border border-white/20 p-10 transition-all duration-500">
            {/* Header inside container */}
            <div className="text-center mb-10">
              <div className="mb-4">
                <h1 className="text-4xl font-bold text-white mb-3 tracking-wide">
                  RECOVERY
                </h1>
                <div className="w-32 h-1 bg-gradient-to-r from-slate-400 to-slate-600 mx-auto rounded-full" />
              </div>
              <p className="text-blue-100 text-xl font-light tracking-wide">
                Get back to yappin'
              </p>
            </div>

            <div className="space-y-8">
              {/* Email */}
              <div className="relative">
                <label className="flex items-center text-white text-sm font-semibold mb-3 tracking-wide">
                  <Mail className="mr-2 text-blue-400" size={16} />
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleInputChange}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  className="w-full px-6 py-4 bg-black/20 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400/50 transition-all duration-300 hover:bg-black/30 hover:border-white/30"
                  placeholder="john@example.com"
                />
                {focused === 'email' && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/5 to-purple-400/5 pointer-events-none" />
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full py-4 bg-gradient-to-r from-slate-700 to-slate-900 text-white font-bold text-lg rounded-xl shadow-2xl hover:from-slate-600 hover:to-slate-800 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-slate-400/50 active:scale-95 relative overflow-hidden group cursor-pointer"
                disabled={isSendingReset}
              > 
                {isSendingReset ? (
                  <span className="relative z-10 tracking-wide">Sending...</span>
                ) : (
                  <span className="relative z-10 tracking-wide">SEND RESET LINK</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-500 to-slate-700 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-white/80 text-lg">
                Remember your password?{' '}
                <button className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300 hover:underline decoration-2 underline-offset-4 cursor-pointer"
                  onClick={() => navigate('/login')}>
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
