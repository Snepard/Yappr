import React, { useState, useEffect } from 'react';
import { User, Mail, Camera, Atom, ArrowLeft, Home } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });

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
          <div className="dot absolute w-[1.75vw] h-[1.75vw] bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-dotPulse"></div>
          <div className="dot absolute w-[1.75vw] h-[1.75vw] bg-gradient-to-r from-pink-400 to-orange-400 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-50 animate-dotPulseReverse"></div>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-purple-900/30 to-black/70 z-10"></div>

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-30">
        <Link 
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-800/60 to-purple-800/60 backdrop-blur-lg rounded-full border border-purple-400/30 text-purple-200 hover:text-white hover:from-slate-700/70 hover:to-purple-700/70 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          <Home className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      {/* Main Content */}
      <main className="relative z-20 flex justify-center items-center min-h-screen p-8">
        <div className="bg-gradient-to-br from-slate-800/40 via-slate-900/50 to-purple-900/40 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-purple-400/30 shadow-2xl shadow-purple-500/10">
          
          {/* Profile Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-lg">
              Profile
            </h2>
            <p className="text-purple-200 text-sm font-medium">Your profile information</p>
          </div>

          {/* Profile Photo Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div 
                className="w-24 h-24 bg-gradient-to-br from-cyan-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-300 border-3 border-purple-300/40 shadow-lg shadow-purple-500/30 overflow-hidden hover:shadow-purple-400/50"
                onClick={handleCameraClick}
              >
                <img 
                  src={selectedImg || authUser?.profilePic || "/avatar.png"} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div 
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-purple-800/90 to-slate-800/90 rounded-full flex items-center justify-center border border-purple-400/40 cursor-pointer hover:from-purple-700/90 hover:to-slate-700/90 transition-all shadow-lg"
                onClick={handleCameraClick}
              >
                <Camera className="w-3 h-3 text-purple-200" />
              </div>
              
              {/* Hidden File Input */}
              <input
                id="avatar-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </div>
            <p className="text-purple-300 text-xs font-medium">{ isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo" }</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-purple-200 text-sm mb-2 font-medium">
                <User className="w-4 h-4 text-cyan-400" />
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                readOnly
                className="w-full p-3 bg-slate-800/60 border border-purple-400/30 rounded-lg text-purple-100 transition-all duration-300 backdrop-blur-sm focus:border-purple-400/60 focus:bg-slate-700/60"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-purple-200 text-sm mb-2 font-medium">
                <Mail className="w-4 h-4 text-pink-400" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="w-full p-3 bg-slate-800/60 border border-purple-400/30 rounded-lg text-purple-100 transition-all duration-300 backdrop-blur-sm focus:border-purple-400/60 focus:bg-slate-700/60"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Account Information Section */}
          <div className="mt-8 pt-6 border-t border-purple-400/30">
            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent drop-shadow-sm">Account Information</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-purple-400/20">
                <span className="text-purple-300 text-sm font-medium">Member Since</span>
                <span className="text-cyan-200 text-sm font-semibold">{getMemberSinceDate()}</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-purple-300 text-sm font-medium">Account Status</span>
                <span className="text-emerald-200 text-sm font-bold bg-gradient-to-r from-emerald-500/30 to-green-500/30 px-3 py-1 rounded-lg border border-emerald-400/40">
                  {authUser ? 'Active' : 'Inactive'}
                </span>
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