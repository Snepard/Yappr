import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useThemeStore } from "../store/useThemeStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import Tooltip from "./Tooltip";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const { sendMessage } = useChatStore();
  const { selectedGroup, activeTimeout, sendGroupMessage } = useGroupStore();
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";

  const isTimedOut = Boolean(selectedGroup && activeTimeout?.isTimedOut);

  const handleImageChange = (e) => {
    if (isTimedOut) return;
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (isTimedOut) {
      toast.error("You are timed out in this group and cannot send messages.");
      return;
    }
    if (!text.trim() && !imagePreview) return;

    try {
      if (selectedGroup) {
        await sendGroupMessage(selectedGroup._id, {
          text: text.trim(),
          image: imagePreview,
        });
      } else {
        await sendMessage({
          text: text.trim(),
          image: imagePreview,
        });
      }

      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleTextareaInput = (e) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
  };

  return (
    <div className={`p-3 sm:p-4 transition-all ${
      isNeubrutalism
        ? 'bg-[#FFFDF0] border-t-3 border-black text-black'
        : 'bg-white/90 backdrop-blur-xl border-t border-sky-100'
    }`}>
      {imagePreview && (
        <div className="mb-3">
          <div className="inline-block relative">
            <img
              src={imagePreview}
              alt="Preview"
              className={`w-20 h-20 sm:w-24 sm:h-24 object-cover ${
                isNeubrutalism
                  ? 'border-3 border-black shadow-[3px_3px_0_#000] rounded-none'
                  : 'rounded-2xl border-2 border-sky-100 shadow-md'
              }`}
            />
            <Tooltip label="Remove image" position="top">
              <button
                onClick={removeImage}
                className={`absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center cursor-pointer transition-all ${
                  isNeubrutalism
                    ? 'bg-[#FF007A] text-white border border-black rounded-none shadow-[1px_1px_0_#000]'
                    : 'rounded-full bg-red-500 text-white hover:bg-red-600 shadow-md'
                }`}
                type="button"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
        <div className="flex-1 relative flex items-center">
          <textarea
            disabled={isTimedOut}
            className={`w-full resize-none min-h-[2.5rem] sm:min-h-[2.75rem] max-h-32 
                       py-2 sm:py-2.5 pl-4 pr-11 text-xs sm:text-sm leading-normal
                       transition-all duration-150 overflow-hidden ${
                         isNeubrutalism
                           ? isTimedOut
                             ? "bg-amber-200 border-3 border-black text-black font-extrabold placeholder:text-black/60 rounded-none cursor-not-allowed"
                             : "bg-white text-black border-3 border-black shadow-[3px_3px_0_#000] focus:shadow-[5px_5px_0_#000] focus:outline-none rounded-none font-bold placeholder:text-gray-500"
                           : isTimedOut
                             ? "bg-amber-100/50 border-amber-300 text-amber-900 placeholder:text-amber-700/60 font-semibold cursor-not-allowed rounded-3xl"
                             : "bg-sky-50/60 border-sky-200/70 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 rounded-3xl"
                       }`}
            placeholder={isTimedOut ? "🔒 You are currently timed out in this group (Read-only mode)" : "Message..."}
            value={text}
            onChange={handleTextareaInput}
            onKeyPress={handleKeyPress}
            rows="1"
            style={{
              height: 'auto',
              minHeight: '2.5rem',
              lineHeight: '1.4'
            }}
          />
          
          <div className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <Tooltip label={isTimedOut ? "Timed out" : "Attach image"} position="top">
              <button
                type="button"
                disabled={isTimedOut}
                className={`p-1.5 transition-all duration-150 flex items-center justify-center ${
                  isNeubrutalism
                    ? isTimedOut
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-black hover:bg-[#FFE600] border border-transparent hover:border-black rounded-none cursor-pointer"
                    : isTimedOut
                      ? "text-gray-300 cursor-not-allowed"
                      : imagePreview 
                        ? "text-blue-600 bg-blue-50 rounded-full" 
                        : "text-gray-400 hover:text-blue-600 hover:bg-sky-100/60 rounded-full"
                }`}
                onClick={() => !isTimedOut && fileInputRef.current?.click()}
              >
                <Image className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </Tooltip>
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
          disabled={isTimedOut}
        />

        <Tooltip label={isTimedOut ? "Timed out" : "Send message"} position="top">
          <button
            type="submit"
            disabled={isTimedOut || (!text.trim() && !imagePreview)}
            className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center transition-all duration-150 flex-shrink-0 ${
              isNeubrutalism
                ? isTimedOut || (!text.trim() && !imagePreview)
                  ? "bg-gray-300 text-gray-600 border-2 border-black rounded-none cursor-not-allowed font-black"
                  : "bg-[#FFE600] text-black border-3 border-black shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#000] rounded-none cursor-pointer"
                : isTimedOut || (!text.trim() && !imagePreview)
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed rounded-full" 
                  : "bg-gradient-to-r from-blue-600 to-sky-600 text-white hover:scale-105 rounded-full cursor-pointer shadow-xs hover:shadow-md"
            }`}
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </Tooltip>
      </form>
    </div>
  );
};

export default MessageInput;