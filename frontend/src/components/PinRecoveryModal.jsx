import React, { useState } from 'react';
import { ShieldAlert, KeyRound, Lock, AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-md p-6 sm:p-8 transition-all ${
        isNeubrutalism
          ? 'bg-white border-4 border-black shadow-[8px_8px_0_#000] text-black'
          : 'bg-slate-900/90 border border-white/20 rounded-3xl shadow-2xl text-white backdrop-blur-xl'
      }`}>
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-3 rounded-2xl ${
            isNeubrutalism ? 'bg-[#FFE600] border-2 border-black' : 'bg-blue-600/20 border border-blue-500/30'
          }`}>
            <KeyRound className={`w-6 h-6 ${isNeubrutalism ? 'text-black' : 'text-blue-400'}`} />
          </div>
          <div>
            <h2 className={`text-xl font-black ${isNeubrutalism ? 'uppercase' : ''}`}>
              Restore Encryption Keys
            </h2>
            <p className={`text-xs ${isNeubrutalism ? 'text-black/80 font-bold' : 'text-slate-300'}`}>
              Zero-Knowledge E2EE Recovery
            </p>
          </div>
        </div>

        {!showConfirmReset ? (
          <>
            <div className={`p-4 rounded-xl mb-5 text-xs leading-relaxed ${
              isNeubrutalism
                ? 'bg-[#E0F7FA] border-2 border-black shadow-[2px_2px_0_#000]'
                : 'bg-blue-950/40 border border-blue-500/30 text-blue-100'
            }`}>
              <p className="font-medium">
                Enter your <strong>6-digit Backup PIN</strong> to decrypt your private key and instantly restore access to all past conversations.
              </p>
            </div>

            {pinError && (
              <div className={`p-3 rounded-xl mb-4 text-xs font-bold flex items-center space-x-2 ${
                isNeubrutalism
                  ? 'bg-[#FF8080] border-2 border-black text-black'
                  : 'bg-rose-950/50 border border-rose-500/40 text-rose-300'
              }`}>
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handleRecover} className="space-y-4">
              <div>
                <label className={`block text-xs font-black mb-1.5 ${isNeubrutalism ? 'uppercase' : 'text-slate-200'}`}>
                  6-Digit Backup PIN
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
                        : 'bg-black/40 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${
                      isNeubrutalism ? 'text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isRestoringKeys || pin.length !== 6}
                className={`w-full py-3.5 text-sm sm:text-base font-black tracking-wide transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2 ${
                  isNeubrutalism
                    ? 'bg-[#00F0FF] text-black uppercase border-3 border-black shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] active:translate-x-1 active:translate-y-1 rounded-none'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:from-blue-500 hover:to-indigo-500 transform hover:scale-[1.02]'
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
                className={`text-xs font-bold cursor-pointer underline ${
                  isNeubrutalism ? 'text-black hover:text-[#FF007A]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Forgot your 6-digit PIN?
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className={`p-4 rounded-xl text-xs leading-relaxed flex items-start space-x-2.5 ${
              isNeubrutalism
                ? 'bg-[#FFE600] border-2 border-black text-black'
                : 'bg-amber-950/40 border border-amber-500/40 text-amber-200'
            }`}>
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Warning: Key Reset (Last Resort)</p>
                <p>
                  Because Yappr is Zero-Knowledge E2EE, resetting your encryption keys generates a brand new key pair. You will be able to start new chats, but your past encrypted messages cannot be recovered.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className={`flex-1 py-3 text-xs font-black uppercase transition-all cursor-pointer ${
                  isNeubrutalism
                    ? 'bg-white text-black border-2 border-black shadow-[2px_2px_0_#000]'
                    : 'bg-white/10 hover:bg-white/20 text-white rounded-xl'
                }`}
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={handleRegenerateKeys}
                className={`flex-1 py-3 text-xs font-black uppercase transition-all cursor-pointer ${
                  isNeubrutalism
                    ? 'bg-[#FF8080] text-black border-2 border-black shadow-[2px_2px_0_#000]'
                    : 'bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg'
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
