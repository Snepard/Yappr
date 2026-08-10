import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const Tooltip = ({ children, label, position = "top" }) => {
  const [coords, setCoords] = useState(null);
  const [visible, setVisible] = useState(false);
  const targetRef = useRef(null);

  const handleMouseEnter = () => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setCoords(rect);
      setVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  if (!label) return children;

  let tooltipStyle = {};
  if (coords) {
    if (position === "right") {
      tooltipStyle = {
        top: `${coords.top + coords.height / 2}px`,
        left: `${coords.right + 12}px`,
        transform: "translateY(-50%)",
      };
    } else if (position === "left") {
      tooltipStyle = {
        top: `${coords.top + coords.height / 2}px`,
        left: `${coords.left - 12}px`,
        transform: "translate(-100%, -50%)",
      };
    } else if (position === "top") {
      tooltipStyle = {
        top: `${coords.top - 12}px`,
        left: `${coords.left + coords.width / 2}px`,
        transform: "translate(-50%, -100%)",
      };
    } else if (position === "bottom") {
      tooltipStyle = {
        top: `${coords.bottom + 12}px`,
        left: `${coords.left + coords.width / 2}px`,
        transform: "translate(-50%, 0)",
      };
    }
  }

  return (
    <div
      ref={targetRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-flex items-center justify-center"
    >
      {children}
      {visible && coords && (
        <div
          style={tooltipStyle}
          className="fixed px-3 py-1.5 bg-[#111214] text-white text-[12px] font-bold rounded-xl shadow-2xl backdrop-blur-md whitespace-nowrap z-[9999] pointer-events-none transition-all duration-150 ease-out flex items-center justify-center select-none"
        >
          {/* Discord-style Arrow Pointer */}
          {position === "right" && (
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#111214] rotate-45 rounded-xs" />
          )}
          {position === "left" && (
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#111214] rotate-45 rounded-xs" />
          )}
          {position === "top" && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#111214] rotate-45 rounded-xs" />
          )}
          {position === "bottom" && (
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#111214] rotate-45 rounded-xs" />
          )}

          <span className="relative z-10">{label}</span>
        </div>
      )}
    </div>
  );
};

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
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
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
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
    <div className="p-3 sm:p-4 bg-white/90 backdrop-blur-xl border-t border-sky-100">
      {imagePreview && (
        <div className="mb-3">
          <div className="inline-block relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border-2 border-sky-100 shadow-md"
            />
            <Tooltip label="Remove image" position="top">
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white
                           hover:bg-red-600 flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110"
                type="button"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-end gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <textarea
            className="w-full resize-none min-h-[2.5rem] sm:min-h-[2.75rem] max-h-32 
                       py-2.5 sm:py-3 pl-4 pr-11 text-xs sm:text-sm leading-relaxed placeholder:text-gray-400
                       bg-sky-50/60 rounded-2xl border border-sky-200/70
                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                       transition-all duration-200 overflow-hidden"
            placeholder="Message..."
            value={text}
            onChange={handleTextareaInput}
            onKeyPress={handleKeyPress}
            rows="1"
            style={{
              height: 'auto',
              minHeight: '2.5rem',
              lineHeight: '1.5'
            }}
          />
          
          <div className="absolute right-2.5 bottom-2.5">
            <Tooltip label="Attach image" position="top">
              <button
                type="button"
                className={`p-1.5 rounded-xl transition-all duration-200 hover:scale-110
                           ${imagePreview 
                             ? "text-blue-600 bg-blue-50" 
                             : "text-gray-400 hover:text-blue-600 hover:bg-sky-100/60"
                           }`}
                onClick={() => fileInputRef.current?.click()}
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
        />

        <Tooltip label="Send message" position="top">
          <button
            type="submit"
            disabled={!text.trim() && !imagePreview}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all duration-200 
                       shadow-xs hover:shadow-md flex-shrink-0 ${
              (!text.trim() && !imagePreview)
                ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-600 to-sky-600 text-white hover:scale-105 hover:from-blue-700 hover:to-sky-700"
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