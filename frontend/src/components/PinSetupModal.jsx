import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import toast from 'react-hot-toast';

const PinSetupModal = () => {
  const {
    isPinSetupModalOpen,
    setPinSetupModalOpen,
    setupPinBackup,
    isRestoringKeys,
  } = useAuthStore();

  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === 'neubrutalism';

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  if (!isPinSetupModalOpen) return null;

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(value);
  };

  const handleConfirmPinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setConfirmPin(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 6) {
      toast.error('Please enter a 6-digit PIN');
      return;
    }
    if (pin !== confirmPin) {
      toast.error('PINs do not match!');
      return;
    }

    await setupPinBackup(pin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`relative w-full max-w-md p-6 sm:p-8 transition-all ${
        isNeubrutalism
          ? 'bg-white border-4 border-black shadow-[8px_8px_0_#000] text-black'
          : 'bg-slate-900/90 border border-white/20 rounded-3xl shadow-2xl text-white backdrop-blur-xl'
      }`}>
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setPinSetupModalOpen(false)}
          className={`absolute top-4 right-4 p-1.5 rounded-lg cursor-pointer ${
            isNeubrutalism ? 'text-black hover:bg-black/10' : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-3 rounded-2xl ${
            isNeubrutalism ? 'bg-[#FFE600] border-2 border-black' : 'bg-emerald-600/20 border border-emerald-500/30'
          }`}>
            <ShieldCheck className={`w-6 h-6 ${isNeubrutalism ? 'text-black' : 'text-emerald-400'}`} />
          </div>
          <div>
            <h2 className={`text-xl font-black ${isNeubrutalism ? 'uppercase' : ''}`}>
              Secure E2EE Cloud Backup
            </h2>
            <p className={`text-xs ${isNeubrutalism ? 'text-black/80 font-bold' : 'text-slate-300'}`}>
              Set Up Your 6-Digit Recovery PIN
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-xl mb-5 text-xs leading-relaxed ${
          isNeubrutalism
            ? 'bg-[#E0F7FA] border-2 border-black shadow-[2px_2px_0_#000]'
            : 'bg-blue-950/40 border border-blue-500/30 text-blue-100'
        }`}>
          <p className="font-semibold mb-1">ℹ️ Why this is important:</p>
          <p>
            Yappr uses Zero-Knowledge End-to-End Encryption. Setting a 6-digit PIN enables secure cloud recovery so you will never lose your message history if you switch devices or reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-black mb-1.5 ${isNeubrutalism ? 'uppercase' : 'text-slate-200'}`}>
                6-Digit PIN
              </label>
              <input
                type={showPin ? "text" : "password"}
                value={pin}
                onChange={handlePinChange}
                maxLength={6}
                autoFocus
                placeholder="••••••"
                className={`w-full px-3 py-2.5 text-center text-lg tracking-widest font-mono font-black transition-all ${
                  isNeubrutalism
                    ? 'bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] focus:outline-none'
                    : 'bg-black/40 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-black mb-1.5 ${isNeubrutalism ? 'uppercase' : 'text-slate-200'}`}>
                Confirm PIN
              </label>
              <input
                type={showPin ? "text" : "password"}
                value={confirmPin}
                onChange={handleConfirmPinChange}
                maxLength={6}
                placeholder="••••••"
                className={`w-full px-3 py-2.5 text-center text-lg tracking-widest font-mono font-black transition-all ${
                  isNeubrutalism
                    ? 'bg-white text-black border-2 border-black shadow-[2px_2px_0_#000] focus:outline-none'
                    : 'bg-black/40 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400'
                }`}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className={`text-xs font-semibold underline cursor-pointer ${
                isNeubrutalism ? 'text-black' : 'text-emerald-300 hover:text-emerald-200'
              }`}
            >
              {showPin ? "Hide digits" : "Show digits"}
            </button>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setPinSetupModalOpen(false)}
              className={`py-3 px-4 text-xs font-black uppercase transition-all cursor-pointer ${
                isNeubrutalism
                  ? 'bg-white text-black border-2 border-black shadow-[2px_2px_0_#000]'
                  : 'bg-white/10 hover:bg-white/20 text-white rounded-xl'
              }`}
            >
              Remind Later
            </button>

            <button
              type="submit"
              disabled={isRestoringKeys || pin.length !== 6 || confirmPin.length !== 6}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wide transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2 ${
                isNeubrutalism
                  ? 'bg-[#FFE600] text-black border-3 border-black shadow-[3px_3px_0_#000] hover:shadow-[5px_5px_0_#000] active:translate-x-1 active:translate-y-1'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-lg hover:from-emerald-500 hover:to-teal-500 transform hover:scale-[1.02]'
              }`}
            >
              {isRestoringKeys ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Encrypting...</span>
                </>
              ) : (
                <span>Enable Backup</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinSetupModal;
