import React, { useState } from 'react';
import { ShieldAlert, KeyRound, AlertTriangle, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import toast from 'react-hot-toast';

const PinRecoveryModal = () => {
  const {
    isPinRecoveryModalOpen,
    setPinRecoveryModalOpen,
    recoverKeyWithPin,
    isRestoringKeys,
    pinError,
    authUser,
    initializeE2EEKeys
  } = useAuthStore();

  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === 'neubrutalism';

  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isPinRecoveryModalOpen) return null;

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(value);
  };

  const handleRecover = async (e) => {
    e.preventDefault();
    if (pin.length !== 6) {
      toast.error('Please enter a valid 6-digit PIN');
      return;
    }
    await recoverKeyWithPin(pin);
  };

  const handleRegenerateKeys = async () => {
    try {
      toast.loading("Generating new E2EE key pair...", { id: "keygen" });
      await initializeE2EEKeys(authUser);
      setPinRecoveryModalOpen(false);
      setShowConfirmReset(false);
      toast.success("New keys generated. You can now chat securely (old messages remain locked).", { id: "keygen" });
    } catch (err) {
      toast.error("Failed to generate new keys.", { id: "keygen" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/20 backdrop-blur-md animate-fade-in select-none">
      <div className={`w-full max-w-md p-6 sm:p-8 transition-all ${
        isNeubrutalism
          ? 'bg-white border-4 border-black shadow-[8px_8px_0_#000] text-black'
          : 'bg-white/75 backdrop-blur-3xl backdrop-saturate-200 border border-white/90 shadow-[0_24px_70px_rgba(14,165,233,0.25),0_4px_16px_rgba(0,0,0,0.04)] rounded-3xl text-slate-800 ring-1 ring-sky-300/30'
      }`}>
        {/* Header */}
        <div className="flex items-center space-x-3.5 mb-5">
          <div className={`p-3 rounded-2xl ${
            isNeubrutalism
              ? 'bg-[#FFE600] border-2 border-black'
              : 'bg-blue-500/10 border border-blue-500/20 text-blue-600 shadow-xs backdrop-blur-sm'
          }`}>
            <KeyRound className={`w-6 h-6 ${isNeubrutalism ? 'text-black' : 'text-blue-600'}`} />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isNeubrutalism ? 'uppercase text-black font-black' : 'text-slate-900'}`}>
              Restore Messages
            </h2>
            <p className={`text-xs ${isNeubrutalism ? 'text-black/80 font-bold' : 'text-slate-500 font-medium'}`}>
              Zero-Knowledge E2EE Recovery
            </p>
          </div>
        </div>

        {!showConfirmReset ? (
          <>
            <div className={`p-4 rounded-2xl mb-5 text-xs leading-relaxed ${
              isNeubrutalism
                ? 'bg-[#E0F7FA] border-2 border-black shadow-[2px_2px_0_#000]'
                : 'bg-sky-50/70 backdrop-blur-lg border border-sky-200/80 text-slate-700 shadow-xs'
            }`}>
              <p className="font-normal">
                Enter your <strong className="font-semibold text-slate-900">6-digit Recovery PIN</strong> to decrypt your private key and instantly restore access to all past conversations.
              </p>
            </div>

            {pinError && (
              <div className={`p-3.5 rounded-2xl mb-4 text-xs font-semibold flex items-center space-x-2.5 ${
                isNeubrutalism
                  ? 'bg-[#FF8080] border-2 border-black text-black'
                  : 'bg-rose-50/80 backdrop-blur-sm border border-rose-200/80 text-rose-700'
              }`}>
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handleRecover} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isNeubrutalism ? 'uppercase text-black font-black' : 'text-slate-700'}`}>
                  6-Digit Recovery PIN
                </label>
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={handlePinChange}
                    maxLength={6}
                    autoFocus
                    placeholder="••••••"
                    className={`w-full px-4 py-3 text-center text-xl tracking-[0.5em] font-mono font-black transition-all ${
                      isNeubrutalism
                        ? 'bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] focus:shadow-[5px_5px_0_#000] focus:outline-none'
                        : 'bg-white/80 backdrop-blur-md border border-sky-200/90 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 focus:bg-white shadow-xs'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${
                      isNeubrutalism ? 'text-black' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isRestoringKeys || pin.length !== 6}
                className={`w-full py-3.5 text-sm sm:text-base font-bold tracking-wide transition-all flex items-center justify-center space-x-2 ${
                  isNeubrutalism
                    ? 'bg-[#00F0FF] text-black uppercase border-3 border-black shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] active:translate-x-1 active:translate-y-1 rounded-none font-black cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl shadow-md shadow-blue-500/25 cursor-pointer hover:scale-[1.02] active:scale-[0.99] disabled:bg-blue-400 disabled:hover:bg-blue-400 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none'
                }`}
              >
                {isRestoringKeys ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Decrypting Private Key...</span>
                  </>
                ) : (
                  <span>Unlock & Restore Messages</span>
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className={`text-xs font-semibold cursor-pointer underline transition-colors ${
                  isNeubrutalism ? 'text-black hover:text-[#FF007A]' : 'text-slate-500 hover:text-blue-600'
                }`}
              >
                Forgot your 6-digit PIN?
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className={`p-4 rounded-2xl text-xs leading-relaxed flex items-start space-x-2.5 ${
              isNeubrutalism
                ? 'bg-[#FFE600] border-2 border-black text-black'
                : 'bg-amber-50/80 backdrop-blur-sm border border-amber-200/80 text-amber-900'
            }`}>
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-bold mb-1 text-amber-950">Warning: Key Reset (Last Resort)</p>
                <p className="text-amber-800">
                  Because Yappr is Zero-Knowledge E2EE, resetting your encryption keys generates a brand new key pair. You will be able to start new chats, but your past encrypted messages cannot be recovered.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className={`flex-1 py-3 text-xs font-bold uppercase transition-all cursor-pointer ${
                  isNeubrutalism
                    ? 'bg-white text-black border-2 border-black shadow-[2px_2px_0_#000]'
                    : 'bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 rounded-2xl border border-sky-200/70 shadow-xs hover:text-slate-900'
                }`}
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={handleRegenerateKeys}
                className={`flex-1 py-3 text-xs font-bold uppercase transition-all cursor-pointer ${
                  isNeubrutalism
                    ? 'bg-[#FF8080] text-black border-2 border-black shadow-[2px_2px_0_#000]'
                    : 'bg-rose-600 hover:bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20'
                }`}
              >
                Generate New Keys
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PinRecoveryModal;
