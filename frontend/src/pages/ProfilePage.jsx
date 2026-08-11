import React, { useState, useEffect } from 'react';
import { User, Mail, Camera, ArrowLeft, Home, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from "react-router-dom";
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, changePassword, isChangingPassword } = useAuthStore();
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
        // Calculate new dimensions while maintaining aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Draw and compress the image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob with compression
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if(!file) return;

    try {
      // Compress the image first
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

  // Format member since date
  const getMemberSinceDate = () => {
    if (authUser?.createdAt) {
      return new Date(authUser.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    }
    return 'January 2024'; // fallback
  };

  // Generate grid squares
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
    <div className="min-h-screen text-white relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Animated Dot Grid Background */}
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

      {/* Dark Overlay for Better Contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-blue-900/30 to-black/70 z-10"></div>

      {/* Main Content */}
      <main className="relative z-20 flex justify-center items-center min-h-screen p-4 sm:p-6 lg:p-8 pt-16 sm:pt-6">
        <div className="bg-gradient-to-br from-slate-800/50 via-slate-900/60 to-blue-900/40 backdrop-blur-xl rounded-3xl p-5 sm:p-8 w-full max-w-4xl lg:max-w-5xl border border-blue-400/30 shadow-2xl shadow-blue-500/10">
          
          {/* Profile Header Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 lg:mb-8 border-b border-blue-400/20 pb-4">
            <Link 
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-800/80 to-blue-800/80 backdrop-blur-lg rounded-full border border-blue-400/30 text-blue-200 hover:text-white hover:from-slate-700/80 hover:to-blue-700/80 transition-all duration-300 shadow-md group self-start sm:self-center"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
              <Home className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium">Back to Home</span>
            </Link>

            <div className="text-center sm:text-right w-full sm:w-auto">
              <h2 className="text-2xl sm:text-3xl font-bold mb-1 bg-gradient-to-r from-cyan-300 via-blue-300 to-sky-300 bg-clip-text text-transparent drop-shadow-lg">
                Profile Settings
              </h2>
              <p className="text-blue-200 text-xs sm:text-sm font-medium">Manage your personal details and security settings</p>
            </div>
          </div>

          {/* 2-Column Landscape Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-start">
            
            {/* LEFT COLUMN: Profile Info & Avatar */}
            <div className="space-y-5">
              {/* Photo Upload */}
              <div className="text-center bg-slate-900/40 p-4 rounded-2xl border border-blue-400/20">
                <div className="relative inline-block mb-2.5">
                  <div 
                    className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-cyan-500 via-blue-600 to-sky-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-300 border-3 border-blue-300/40 shadow-lg shadow-blue-500/30 overflow-hidden hover:shadow-blue-400/50"
                    onClick={handleCameraClick}
                  >
                    <img 
                      src={selectedImg || authUser?.profilePic || "/avatar.png"} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div 
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-blue-800/90 to-slate-800/90 rounded-full flex items-center justify-center border border-blue-400/40 cursor-pointer hover:from-blue-700/90 hover:to-slate-700/90 transition-all shadow-lg"
                    onClick={handleCameraClick}
                  >
                    <Camera className="w-4 h-4 text-blue-200" />
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
                <p className="text-blue-300 text-xs font-medium">{ isUpdatingProfile ? "Uploading photo..." : "Click photo or camera icon to update" }</p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-blue-200 text-xs sm:text-sm mb-1.5 font-medium">
                    <User className="w-4 h-4 text-cyan-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    readOnly
                    className="w-full p-2.5 sm:p-3 bg-slate-800/60 border border-blue-400/30 rounded-xl text-xs sm:text-sm text-blue-100 backdrop-blur-sm focus:border-blue-400/60"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-blue-200 text-xs sm:text-sm mb-1.5 font-medium">
                    <Mail className="w-4 h-4 text-pink-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full p-2.5 sm:p-3 bg-slate-800/60 border border-blue-400/30 rounded-xl text-xs sm:text-sm text-blue-100 backdrop-blur-sm focus:border-blue-400/60"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Account Info */}
              <div className="p-4 bg-slate-900/40 rounded-2xl border border-blue-400/20 space-y-2">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-blue-300 font-medium">Member Since</span>
                  <span className="text-cyan-200 font-semibold">{getMemberSinceDate()}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-blue-300 font-medium">Account Status</span>
                  <span className="text-emerald-200 text-xs font-bold bg-gradient-to-r from-emerald-500/30 to-green-500/30 px-3 py-1 rounded-lg border border-emerald-400/40">
                    {authUser ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Security & Change Password */}
            <div className="space-y-6">
              <div className="bg-slate-900/40 p-5 rounded-2xl border border-blue-400/20 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b border-blue-400/20 pb-3">
                  <h3 className="text-base font-semibold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-cyan-400" /> Password & Security
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                    className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 bg-blue-500/20 hover:bg-blue-500/30 px-3 py-1.5 rounded-lg border border-blue-400/30 transition-all cursor-pointer"
                  >
                    {showPasswordSection ? "Cancel" : "Change Password"}
                  </button>
                </div>

                {showPasswordSection ? (
                  <form onSubmit={handlePasswordChange} className="space-y-3.5 animate-fadeIn flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Current Password */}
                      <div>
                        <label className="text-xs text-blue-200 font-medium mb-1 block">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPass ? "text" : "password"}
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            className="w-full p-2.5 bg-slate-800/80 border border-blue-400/30 rounded-xl text-xs text-white placeholder-blue-300/40 focus:outline-none focus:border-cyan-400"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300/60 hover:text-white cursor-pointer"
                          >
                            {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="text-xs text-blue-200 font-medium mb-1 block">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPass ? "text" : "password"}
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            className="w-full p-2.5 bg-slate-800/80 border border-blue-400/30 rounded-xl text-xs text-white placeholder-blue-300/40 focus:outline-none focus:border-cyan-400"
                            placeholder="At least 6 characters"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300/60 hover:text-white cursor-pointer"
                          >
                            {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <label className="text-xs text-blue-200 font-medium mb-1 block">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwords.confirmPassword}
                          onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                          className="w-full p-2.5 bg-slate-800/80 border border-blue-400/30 rounded-xl text-xs text-white placeholder-blue-300/40 focus:outline-none focus:border-cyan-400"
                          placeholder="Re-enter new password"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 mt-3"
                    >
                      {isChangingPassword ? "Updating Password..." : "Update Password"}
                    </button>
                  </form>
                ) : (
                  <div className="py-12 text-center text-blue-200/70 space-y-2 flex-1 flex flex-col justify-center items-center">
                    <Lock className="w-10 h-10 mx-auto opacity-50 text-cyan-400 mb-1" />
                    <p className="text-sm font-semibold text-white">Password & Security Controls</p>
                    <p className="text-xs text-blue-300/70 max-w-xs">Click "Change Password" above to update your password at any time.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>

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
    </div>
  );
};

export default ProfilePage;