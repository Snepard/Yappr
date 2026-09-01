import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Loader2, X, Info, CloudUpload } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/20 backdrop-blur-md animate-fade-in select-none">
      <div className={`relative w-full max-w-md p-6 sm:p-8 transition-all ${
        isNeubrutalism
          ? 'bg-white border-4 border-black shadow-[8px_8px_0_#000] text-black'
          : 'bg-white/75 backdrop-blur-3xl backdrop-saturate-200 border border-white/90 shadow-[0_24px_70px_rgba(14,165,233,0.25),0_4px_16px_rgba(0,0,0,0.04)] rounded-3xl text-slate-800 ring-1 ring-sky-300/30'
      }`}>
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setPinSetupModalOpen(false)}
          className={`absolute top-4 right-4 p-1.5 rounded-xl cursor-pointer transition-colors ${
            isNeubrutalism ? 'text-black hover:bg-black/10' : 'text-slate-400 hover:text-slate-700 hover:bg-sky-100/60'
          }`}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3.5 mb-5">
          <div className={`p-3 rounded-2xl ${
            isNeubrutalism
              ? 'bg-[#FFE600] border-2 border-black'
              : 'bg-blue-500/10 border border-blue-500/20 text-blue-600 shadow-xs backdrop-blur-sm'
          }`}>
            <ShieldCheck className={`w-6 h-6 ${isNeubrutalism ? 'text-black' : 'text-blue-600'}`} />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isNeubrutalism ? 'uppercase text-black font-black' : 'text-slate-900'}`}>
              Cloud Backup
            </h2>
            <p className={`text-xs ${isNeubrutalism ? 'text-black/80 font-bold' : 'text-slate-500 font-medium'}`}>
              Protect your messages with a Recovery PIN
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-2xl mb-5 text-xs leading-relaxed ${
          isNeubrutalism
            ? 'bg-[#E0F7FA] border-2 border-black shadow-[2px_2px_0_#000]'
            : 'bg-sky-50/70 backdrop-blur-lg border border-sky-200/80 text-slate-700 shadow-xs'
        }`}>
          <p className={`font-semibold mb-1 flex items-center gap-1.5 ${isNeubrutalism ? 'text-black' : 'text-blue-900'}`}>
            <Info className={`w-3.5 h-3.5 flex-shrink-0 ${isNeubrutalism ? 'text-black' : 'text-blue-600'}`} />
            Why this matters
          </p>
          <p className={isNeubrutalism ? 'text-black font-medium' : 'text-slate-600'}>
            Yappr uses <strong className={isNeubrutalism ? 'text-black' : 'text-slate-900 font-semibold'}>Zero-Knowledge End-to-End Encryption</strong> to keep your conversations private. A 6-digit Recovery PIN lets you securely restore your message history whenever you sign in on a new device or reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isNeubrutalism ? 'uppercase text-black font-black' : 'text-slate-700'}`}>
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
                    : 'bg-white/80 backdrop-blur-md border border-sky-200/90 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 focus:bg-white shadow-xs'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isNeubrutalism ? 'uppercase text-black font-black' : 'text-slate-700'}`}>
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
                    : 'bg-white/80 backdrop-blur-md border border-sky-200/90 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 focus:bg-white shadow-xs'
                }`}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className={`text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                isNeubrutalism ? 'text-black' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPin ? "Hide digits" : "Show digits"}</span>
            </button>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setPinSetupModalOpen(false)}
              className={`py-3 px-4 text-xs font-bold uppercase transition-all cursor-pointer ${
                isNeubrutalism
                  ? 'bg-white text-black border-2 border-black shadow-[2px_2px_0_#000]'
                  : 'bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 rounded-2xl border border-sky-200/70 shadow-xs hover:text-slate-900'
              }`}
            >
              Remind Later
            </button>

            <button
              type="submit"
              disabled={isRestoringKeys || pin.length !== 6 || confirmPin.length !== 6}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center space-x-2 ${
                isNeubrutalism
                  ? 'bg-[#FFE600] text-black border-3 border-black shadow-[3px_3px_0_#000] hover:shadow-[5px_5px_0_#000] active:translate-x-1 active:translate-y-1 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl shadow-md shadow-blue-500/25 cursor-pointer hover:scale-[1.02] active:scale-[0.99] disabled:bg-blue-400 disabled:hover:bg-blue-400 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none'
              }`}
            >
              {isRestoringKeys ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Encrypting...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4" />
                  <span>Enable Backup</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinSetupModal;
