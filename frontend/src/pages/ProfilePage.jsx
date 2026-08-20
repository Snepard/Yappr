import React, { useState, useEffect } from 'react';
import { User, Mail, Camera, ArrowLeft, Home, KeyRound, Lock, Eye, EyeOff, Palette, Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { Link } from "react-router-dom";
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, changePassword, isChangingPassword, setPinSetupModalOpen } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const isNeubrutalism = theme === 'neubrutalism';

  const [selectedImg, setSelectedImg] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error("Please fill in both current and new password");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    const success = await changePassword(passwords.currentPassword, passwords.newPassword);
    if (success) {
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
    }
  };

  // Update form data when authUser changes
  useEffect(() => {
    if (authUser) {
      setFormData({
        fullName: authUser.fullName || authUser.name || '',
        email: authUser.email || ''
      });
    }
  }, [authUser]);

  const compressImage = (file, maxWidth = 400, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if(!file) return;

    try {
      const compressedFile = await compressImage(file);
      const reader = new FileReader();

      reader.onload = async () => {
        const base64Image = reader.result;
        setSelectedImg(base64Image);
        await updateProfile({ profilePic: base64Image });
      };

      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error compressing image:', error);
    }
  };

  const handleCameraClick = () => {
    document.getElementById('avatar-upload').click();
  };

  const getMemberSinceDate = () => {
    if (authUser?.createdAt) {
      return new Date(authUser.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    }
    return 'January 2024';
  };

  const generateGridSquares = () => {
    const cols = 12;
    const rows = 12;
    const cells = cols * rows;
    const centerRow = Math.ceil(rows / 2);
    const centerCol = Math.ceil(cols / 2);
    
    return Array.from({ length: cells }, (_, index) => {
      const row = Math.floor(index / cols) + 1;
      const col = (index % cols) + 1;
      
      const centerRowPower = (centerRow - Math.abs(centerRow - row)) / 4;
      const centerColPower = (centerCol - Math.abs(centerCol - col)) / 4;
      const opacity = (centerColPower + centerRowPower) * 0.5;
      const delay = (centerColPower + centerRowPower) * -0.5;
      
      return (
        <div 
          key={index} 
          className="square relative"
          style={{
            '--opacity': opacity,
            '--delay': `${delay}s`
          }}
        >
          <div className="dot absolute w-[1.75vw] h-[1.75vw] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-dotPulse"></div>
          <div className="dot absolute w-[1.75vw] h-[1.75vw] bg-gradient-to-r from-pink-400 to-orange-400 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-50 animate-dotPulseReverse"></div>
        </div>
      );
    });
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-200 ${
      isNeubrutalism ? 'bg-[#FFFDF0] text-black' : 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white'
    }`}>
      {/* Background Grids */}
      {!isNeubrutalism ? (
        <>
          <div className="absolute inset-0 z-0">
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 grid grid-cols-12 grid-rows-12"
              style={{
                width: 'calc(100vw + 8.33vw)',
                height: 'calc(100vw + 8.33vw)'
              }}
            >
              {generateGridSquares()}
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-blue-900/30 to-black/70 z-10"></div>
        </>
      ) : (
        <div 
          className="absolute inset-0 z-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, #FFFDF0 1px)`,
            backgroundSize: `32px 32px`
          }}
        />
      )}

      {/* Main Content */}
      <main className="relative z-20 flex justify-center items-center min-h-screen p-4 sm:p-6 lg:p-8 pt-16 sm:pt-6">
        <div className={`w-full max-w-4xl lg:max-w-5xl transition-all duration-200 ${
          isNeubrutalism 
            ? 'bg-white border-4 border-black p-6 sm:p-9 shadow-[8px_8px_0px_#000000] rounded-none'
            : 'bg-gradient-to-br from-slate-800/50 via-slate-900/60 to-blue-900/40 backdrop-blur-xl rounded-3xl p-5 sm:p-8 border border-blue-400/30 shadow-2xl shadow-blue-500/10'
        }`}>
          
          {/* Profile Header Bar */}
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 lg:mb-8 pb-4 ${
            isNeubrutalism ? 'border-b-3 border-black' : 'border-b border-blue-400/20'
          }`}>
            <Link 
              to="/"
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm transition-all duration-150 group self-start sm:self-center ${
                isNeubrutalism
                  ? 'bg-[#FFE600] text-black font-extrabold border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_#000]'
                  : 'bg-gradient-to-r from-slate-800/80 to-blue-800/80 backdrop-blur-lg rounded-full border border-blue-400/30 text-blue-200 hover:text-white hover:from-slate-700/80 hover:to-blue-700/80 shadow-md font-medium'
              }`}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <div className="text-center sm:text-right w-full sm:w-auto">
              <h2 className={`text-2xl sm:text-3xl font-black mb-1 ${
                isNeubrutalism 
                  ? 'text-black uppercase tracking-tight'
                  : 'bg-gradient-to-r from-cyan-300 via-blue-300 to-sky-300 bg-clip-text text-transparent drop-shadow-lg font-bold'
              }`}>
                Profile Settings
              </h2>
              <p className={isNeubrutalism ? 'text-black font-bold text-xs sm:text-sm' : 'text-blue-200 text-xs sm:text-sm font-medium'}>
                Manage your personal details and security settings
              </p>
            </div>
          </div>

          {/* 2-Column Landscape Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-start">
            
            {/* LEFT COLUMN: Profile Info & Avatar */}
            <div className="space-y-5">
              {/* Photo Upload */}
              <div className={`text-center p-4 ${
                isNeubrutalism 
                  ? 'bg-[#FFFDF0] border-3 border-black shadow-[4px_4px_0px_#000000] rounded-none' 
                  : 'bg-slate-900/40 rounded-2xl border border-blue-400/20'
              }`}>
                <div className="relative inline-block mb-2.5">
                  <div 
                    className={`w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden ${
                      isNeubrutalism
                        ? 'bg-[#00E5FF] border-3 border-black shadow-[4px_4px_0px_#000000] rounded-none hover:translate-x-0.5 hover:translate-y-0.5'
                        : 'bg-gradient-to-br from-cyan-500 via-blue-600 to-sky-500 rounded-full hover:scale-105 border-3 border-blue-300/40 shadow-lg shadow-blue-500/30'
                    }`}
                    onClick={handleCameraClick}
                  >
                    <img 
                      src={selectedImg || authUser?.profilePic || "/avatar.png"} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div 
                    className={`absolute -bottom-1 -right-1 w-8 h-8 flex items-center justify-center cursor-pointer transition-all ${
                      isNeubrutalism
                        ? 'bg-[#FF007A] text-white border-2 border-black shadow-[2px_2px_0px_#000000] rounded-none hover:bg-pink-600'
                        : 'bg-gradient-to-br from-blue-800/90 to-slate-800/90 rounded-full border border-blue-400/40 hover:from-blue-700/90 hover:to-slate-700/90 shadow-lg'
                    }`}
                    onClick={handleCameraClick}
                  >
                    <Camera className={`w-4 h-4 ${isNeubrutalism ? 'text-white' : 'text-blue-200'}`} />
                  </div>
                  
                  <input
                    id="avatar-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </div>
                <p className={`text-xs ${isNeubrutalism ? 'text-black font-extrabold' : 'text-blue-300 font-medium'}`}>
                  { isUpdatingProfile ? "Uploading photo..." : "Click photo or camera icon to update" }
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className={`flex items-center gap-2 text-xs sm:text-sm mb-1.5 ${
                    isNeubrutalism ? 'text-black font-black uppercase' : 'text-blue-200 font-medium'
                  }`}>
                    <User className={`w-4 h-4 ${isNeubrutalism ? 'text-black' : 'text-cyan-400'}`} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    readOnly
                    className={`w-full p-2.5 sm:p-3 text-xs sm:text-sm ${
                      isNeubrutalism
                        ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0px_#000000] font-bold rounded-none'
                        : 'bg-slate-800/60 border border-blue-400/30 rounded-xl text-blue-100 backdrop-blur-sm'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className={`flex items-center gap-2 text-xs sm:text-sm mb-1.5 ${
                    isNeubrutalism ? 'text-black font-black uppercase' : 'text-blue-200 font-medium'
                  }`}>
                    <Mail className={`w-4 h-4 ${isNeubrutalism ? 'text-black' : 'text-pink-400'}`} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className={`w-full p-2.5 sm:p-3 text-xs sm:text-sm ${
                      isNeubrutalism
                        ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0px_#000000] font-bold rounded-none'
                        : 'bg-slate-800/60 border border-blue-400/30 rounded-xl text-blue-100 backdrop-blur-sm'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Account Info */}
              <div className={`p-4 space-y-2 ${
                isNeubrutalism 
                  ? 'bg-[#FFFDF0] border-3 border-black shadow-[4px_4px_0px_#000000] rounded-none text-black' 
                  : 'bg-slate-900/40 rounded-2xl border border-blue-400/20'
              }`}>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className={isNeubrutalism ? 'font-black uppercase' : 'text-blue-300 font-medium'}>Member Since</span>
                  <span className={isNeubrutalism ? 'font-extrabold bg-[#FFE600] px-2 py-0.5 border border-black' : 'text-cyan-200 font-semibold'}>{getMemberSinceDate()}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className={isNeubrutalism ? 'font-black uppercase' : 'text-blue-300 font-medium'}>Account Status</span>
                  <span className={`text-xs font-bold px-3 py-1 ${
                    isNeubrutalism
                      ? 'bg-[#00E676] text-black border-2 border-black shadow-[2px_2px_0px_#000000] rounded-none uppercase font-extrabold'
                      : 'text-emerald-200 bg-gradient-to-r from-emerald-500/30 to-green-500/30 rounded-lg border border-emerald-400/40'
                  }`}>
                    {authUser ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Theme Selector & Security */}
            <div className="space-y-6">
              
              {/* Theme Selector Section */}
              <div className={`p-4 space-y-3 transition-all ${
                isNeubrutalism 
                  ? 'bg-[#FFE600] border-3 border-black shadow-[5px_5px_0px_#000000] rounded-none text-black' 
                  : 'bg-slate-900/40 rounded-2xl border border-blue-400/20'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${
                    isNeubrutalism ? 'text-black uppercase tracking-wider font-black text-base' : 'text-blue-100'
                  }`}>
                    <Palette className={`w-4 h-4 ${isNeubrutalism ? 'text-black' : 'text-cyan-400'}`} /> Visual Theme
                  </h3>
                  <span className={`text-[10px] uppercase tracking-wider font-black px-2 py-0.5 ${
                    isNeubrutalism 
                      ? 'bg-black text-yellow-300 border border-black' 
                      : 'bg-blue-500/20 text-cyan-300 border border-blue-400/30 rounded-md'
                  }`}>
                    {isNeubrutalism ? 'Neubrutalism Active' : 'Default UI Active'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Default UI Button */}
                  <button
                    type="button"
                    onClick={() => setTheme('default')}
                    className={`p-3 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      !isNeubrutalism
                        ? 'bg-gradient-to-r from-slate-800 to-blue-900 border-2 border-cyan-400/90 shadow-lg shadow-cyan-500/20 rounded-xl text-white'
                        : 'bg-white text-black border-3 border-black shadow-[3px_3px_0px_#000000] rounded-none hover:bg-amber-50 font-bold'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`text-xs font-bold flex items-center gap-1.5 ${isNeubrutalism ? 'text-black font-black' : 'text-cyan-300'}`}>
                        <Sparkles className="w-3.5 h-3.5" /> Default UI
                      </span>
                      {!isNeubrutalism && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className={`text-[11px] leading-tight ${isNeubrutalism ? 'text-black font-medium' : 'text-blue-200/80'}`}>
                      Dark glassmorphic glow
                    </p>
                  </button>

                  {/* Neubrutalism Button */}
                  <button
                    type="button"
                    onClick={() => setTheme('neubrutalism')}
                    className={`p-3 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isNeubrutalism
                        ? 'bg-[#FF007A] text-white border-3 border-black shadow-[4px_4px_0px_#000000] rounded-none font-black'
                        : 'bg-slate-800/60 border border-slate-700 hover:border-slate-500 rounded-xl text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`text-xs uppercase tracking-wide flex items-center gap-1 ${isNeubrutalism ? 'font-black text-white' : 'font-bold'}`}>
                        <Zap className={`w-3.5 h-3.5 ${isNeubrutalism ? 'text-yellow-300 fill-yellow-300' : 'text-amber-400 fill-amber-400'}`} /> Neubrutalism
                      </span>
                      {isNeubrutalism && <Check className="w-4 h-4 text-white font-bold" />}
                    </div>
                    <p className={`text-[11px] leading-tight ${isNeubrutalism ? 'text-white font-bold' : 'text-slate-400'}`}>
                      Bold colors & hard shadows
                    </p>
                  </button>
                </div>
              </div>

              {/* Password & Security Section */}
              <div className={`p-5 h-full flex flex-col ${
                isNeubrutalism 
                  ? 'bg-[#FFFDF0] border-3 border-black shadow-[5px_5px_0px_#000000] rounded-none text-black' 
                  : 'bg-slate-900/40 rounded-2xl border border-blue-400/20'
              }`}>
                <div className={`flex justify-between items-center mb-4 pb-3 ${
                  isNeubrutalism ? 'border-b-3 border-black' : 'border-b border-blue-400/20'
                }`}>
                  <h3 className={`text-base font-semibold flex items-center gap-2 ${
                    isNeubrutalism 
                      ? 'text-black font-black uppercase' 
                      : 'bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent'
                  }`}>
                    <KeyRound className={`w-4 h-4 ${isNeubrutalism ? 'text-black' : 'text-cyan-400'}`} /> Password & Security
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                    className={`text-xs font-semibold px-3 py-1.5 transition-all cursor-pointer ${
                      isNeubrutalism
                        ? 'bg-[#00E5FF] text-black font-extrabold border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-cyan-300 active:translate-x-0.5 active:translate-y-0.5 rounded-none'
                        : 'text-cyan-300 hover:text-cyan-200 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg border border-blue-400/30'
                    }`}
                  >
                    {showPasswordSection ? "Cancel" : "Change Password"}
                  </button>
                </div>

                {showPasswordSection ? (
                  <form onSubmit={handlePasswordChange} className="space-y-3.5 animate-fadeIn flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Current Password */}
                      <div>
                        <label className={`text-xs font-medium mb-1 block ${isNeubrutalism ? 'text-black font-bold uppercase' : 'text-blue-200'}`}>Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPass ? "text" : "password"}
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            className={`w-full p-2.5 text-xs ${
                              isNeubrutalism
                                ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0px_#000000] font-bold rounded-none focus:outline-none'
                                : 'bg-slate-800/80 border border-blue-400/30 rounded-xl text-white placeholder-blue-300/40 focus:outline-none focus:border-cyan-400'
                            }`}
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${isNeubrutalism ? 'text-black' : 'text-blue-300/60 hover:text-white'}`}
                          >
                            {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className={`text-xs font-medium mb-1 block ${isNeubrutalism ? 'text-black font-bold uppercase' : 'text-blue-200'}`}>New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPass ? "text" : "password"}
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            className={`w-full p-2.5 text-xs ${
                              isNeubrutalism
                                ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0px_#000000] font-bold rounded-none focus:outline-none'
                                : 'bg-slate-800/80 border border-blue-400/30 rounded-xl text-white placeholder-blue-300/40 focus:outline-none focus:border-cyan-400'
                            }`}
                            placeholder="At least 6 characters"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${isNeubrutalism ? 'text-black' : 'text-blue-300/60 hover:text-white'}`}
                          >
                            {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <label className={`text-xs font-medium mb-1 block ${isNeubrutalism ? 'text-black font-bold uppercase' : 'text-blue-200'}`}>Confirm New Password</label>
                        <input
                          type="password"
                          value={passwords.confirmPassword}
                          onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                          className={`w-full p-2.5 text-xs ${
                            isNeubrutalism
                              ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0px_#000000] font-bold rounded-none focus:outline-none'
                              : 'bg-slate-800/80 border border-blue-400/30 rounded-xl text-white placeholder-blue-300/40 focus:outline-none focus:border-cyan-400'
                          }`}
                          placeholder="Re-enter new password"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className={`w-full py-2.5 text-xs transition-all cursor-pointer disabled:opacity-50 mt-3 ${
                        isNeubrutalism
                          ? 'bg-[#FF007A] text-white font-black uppercase border-3 border-black shadow-[4px_4px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_#000] rounded-none'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-md'
                      }`}
                    >
                      {isChangingPassword ? "Updating Password..." : "Update Password"}
                    </button>
                  </form>
                ) : (
                  <div className="py-8 text-center space-y-3 flex-1 flex flex-col justify-center items-center">
                    <Lock className={`w-8 h-8 mx-auto opacity-60 ${isNeubrutalism ? 'text-black' : 'text-cyan-400'}`} />
                    <p className={`text-sm font-bold ${isNeubrutalism ? 'text-black uppercase' : 'text-white'}`}>Password & Security Controls</p>
                    <p className={`text-xs max-w-xs ${isNeubrutalism ? 'text-black/80 font-medium' : 'text-blue-300/70'}`}>
                      Click "Change Password" to update your account password while preserving all your E2EE keys.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setPinSetupModalOpen(true)}
                        className={`text-xs font-bold px-3.5 py-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                          isNeubrutalism
                            ? 'bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-[4px_4px_0px_#000] rounded-none'
                            : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl'
                        }`}
                      >
                        <ShieldCheck size={14} />
                        {authUser?.pinEncryptedPrivateKey ? "Update 6-Digit Backup PIN" : "Configure 6-Digit Backup PIN"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>

      {!isNeubrutalism && (
        <style jsx>{`
          .square {
            position: relative;
          }
          
          .square::before,
          .square::after {
            content: '';
            position: absolute;
            background: linear-gradient(45deg, #06b6d4, #8b5cf6, #ec4899);
            border-radius: 4px;
            opacity: var(--opacity);
            animation-delay: var(--delay);
          }
          
          .square::before {
            top: 0;
            left: calc(0.875vw + 1.5vw);
            width: calc(100% - 1.75vw - 3vw);
            height: 2px;
            transform: translateY(-50%);
            animation: lineYpulse 2.5s infinite alternate-reverse ease-in;
          }
          
          .square::after {
            top: calc(0.875vw + 1.5vw);
            left: 0;
            width: 2px;
            height: calc(100% - 1.75vw - 3vw);
            transform: translateX(-50%);
            animation: lineXpulse 2.5s infinite alternate-reverse ease-in;
          }
          
          .square .dot {
            opacity: var(--opacity);
            animation-delay: var(--delay);
          }
          
          @keyframes dotPulse {
            0%, 35% {
              transform: translate3d(-50%, -50%, 0) scale(0);
            }
            65%, 100% {
              transform: translate3d(-50%, -50%, 0) scale(1);
            }
          }
          
          @keyframes dotPulseReverse {
            0%, 35% {
              transform: translate3d(-50%, -50%, 0) scale(0.5);
            }
            65%, 100% {
              transform: translate3d(-50%, -50%, 0) scale(0);
            }
          }
          
          @keyframes lineXpulse {
            0%, 35% {
              transform: translate3d(-50%, 0, 0) rotate(0deg);
            }
            65%, 100% {
              transform: translate3d(-50%, 0, 0) rotate(90deg);
            }
          }
          
          @keyframes lineYpulse {
            0%, 35% {
              transform: translate3d(0, -50%, 0) rotate(0deg);
            }
            65%, 100% {
              transform: translate3d(0, -50%, 0) rotate(90deg);
            }
          }
          
          .animate-dotPulse {
            animation: dotPulse 2.5s infinite alternate ease-in;
          }
          
          .animate-dotPulseReverse {
            animation: dotPulse 2.5s infinite alternate-reverse ease-in;
          }
        `}</style>
      )}
    </div>
  );
};

export default ProfilePage;