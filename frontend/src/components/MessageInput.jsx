import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

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
    <div className="p-4 sm:p-6 bg-white/80 backdrop-blur-xl border-t border-gray-200/50">
      {imagePreview && (
        <div className="mb-3 sm:mb-4">
          <div className="inline-block relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border-2 border-gray-200 shadow-lg"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-500 text-white
                         hover:bg-red-600 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
              type="button"
              title="Remove image"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-end gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <textarea
            className="w-full resize-none min-h-[2.5rem] sm:min-h-[3rem] max-h-32 
                       py-3 sm:py-4 pl-4 sm:pl-5 pr-12 sm:pr-14 text-sm leading-relaxed placeholder:text-gray-400
                       bg-gray-50 rounded-2xl border border-gray-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300
                       transition-all duration-200 overflow-hidden"
            placeholder="Type a message..."
            value={text}
            onChange={handleTextareaInput}
            onKeyPress={handleKeyPress}
            rows="1"
            style={{
              height: 'auto',
              minHeight: window.innerWidth >= 640 ? '3rem' : '2.5rem',
              lineHeight: '1.5'
            }}
          />
          
          <button
            type="button"
            className={`absolute right-3 sm:right-4 bottom-3 sm:bottom-4 p-1.5 sm:p-2 rounded-xl transition-all duration-200 hover:scale-110
                       ${imagePreview 
                         ? "text-blue-500 hover:bg-blue-50" 
                         : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                       }`}
            onClick={() => fileInputRef.current?.click()}
            title="Attach image"
          >
            <Image className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-200 
                     shadow-lg hover:shadow-xl flex-shrink-0 ${
            (!text.trim() && !imagePreview)
              ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
              : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-110 hover:from-blue-600 hover:to-purple-700"
          }`}
          title="Send message"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;