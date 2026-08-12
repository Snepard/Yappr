import React, { memo } from "react";
import { ChevronDown, Copy, Forward, Trash2, Ban } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatMessageTime } from "../lib/utils";

const ChatMessageItem = memo(({
  message,
  isLastMessage,
  isOwnMessage,
  showAvatar,
  senderPic,
  senderName,
  isGroupMode,
  activeMenuMessageId,
  setActiveMenuMessageId,
  onCopy,
  onForward,
  onDelete,
  handleTouchStart,
  handleTouchEnd,
  messageEndRef,
}) => {
  if (message.isSystemMessage) {
    return (
      <div
        ref={isLastMessage ? messageEndRef : null}
        className="flex justify-center my-2.5 w-full"
      >
        <div className="bg-sky-100/90 backdrop-blur-xs border border-sky-200/70 text-slate-700 text-xs font-semibold px-4 py-1.5 rounded-full shadow-2xs text-center max-w-xs sm:max-w-md ring-1 ring-sky-400/20">
          {message.text}
        </div>
      </div>
    );
  }

  const isMenuOpen = activeMenuMessageId === message._id;

  return (
    <div
      ref={isLastMessage ? messageEndRef : null}
      className={`flex w-full group/msg ${isOwnMessage ? "justify-end" : "justify-start"} ${
        !showAvatar ? "mt-1 sm:mt-1.5" : "mt-3 sm:mt-4"
      }`}
    >
      <div
        className={`flex max-w-[85%] sm:max-w-md lg:max-w-xl ${
          isOwnMessage ? "flex-row-reverse" : "flex-row"
        } items-end gap-2 sm:gap-3`}
      >
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 ${showAvatar ? "" : "invisible"}`}>
          {showAvatar && (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white shadow-xs overflow-hidden">
              <img
                src={senderPic}
                alt={senderName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/avatar.png";
                }}
              />
            </div>
          )}
        </div>

        {/* Message Bubble */}
        <div className={`flex flex-col min-w-0 flex-1 ${isOwnMessage ? "items-end" : "items-start"}`}>
          {showAvatar && (
            <div className="text-[11px] text-gray-400 mb-1 px-1 font-medium flex items-center space-x-1.5 select-none">
              {isGroupMode && !isOwnMessage && (
                <span className="font-bold text-gray-700">{senderName} •</span>
              )}
              <span>{formatMessageTime(message.createdAt)}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 group/bubble relative">
            <div
              onTouchStart={() => handleTouchStart(message)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchEnd}
              className={`relative px-3.5 sm:px-4 py-2 sm:py-2.5 ${
                !message.isDeleted ? "pr-7 sm:pr-8" : ""
              } rounded-2xl border shadow-xs min-w-[120px] max-w-full group/msgbubble ${
                message.isDeleted
                  ? "bg-slate-100/90 text-slate-400 border-slate-200/70 font-medium select-none"
                  : isOwnMessage
                  ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white border-blue-400/30 rounded-br-xs"
                  : "bg-white text-gray-800 border-sky-100 rounded-bl-xs"
              }`}
            >
              {/* Options Chevron Trigger */}
              {!message.isDeleted && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuMessageId(isMenuOpen ? null : message._id);
                  }}
                  className={`
                    absolute top-1.5 right-1.5 p-0.5 rounded-full backdrop-blur-xs transition-all duration-200 z-20 cursor-pointer
                    ${
                      isOwnMessage
                        ? "text-white/80 hover:text-white hover:bg-white/20"
                        : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                    }
                    ${isMenuOpen ? "opacity-100 bg-white/20" : "opacity-0 group-hover/msgbubble:opacity-100"}
                  `}
                  title="Message options"
                >
                  <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}

              {/* Context Dropdown Menu */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    onClick={(e) => e.stopPropagation()}
                    className={`
                      absolute z-50 bottom-full mb-2 ${isOwnMessage ? "right-0" : "left-0"}
                      w-44 bg-white/95 backdrop-blur-xl border border-sky-100/90
                      shadow-2xl shadow-sky-500/15 rounded-2xl p-1.5 text-slate-800 ring-1 ring-sky-500/10
                    `}
                  >
                    {message.text && (
                      <button
                        onClick={() => onCopy(message.text)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-sky-50/80 rounded-xl transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-blue-500" />
                        <span>Copy Text</span>
                      </button>
                    )}

                    <button
                      onClick={() => onForward(message)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-sky-50/80 rounded-xl transition-colors cursor-pointer"
                    >
                      <Forward className="w-3.5 h-3.5 text-sky-500" />
                      <span>Forward</span>
                    </button>

                    {isOwnMessage && (
                      <button
                        onClick={() => onDelete(message)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 rounded-xl transition-colors cursor-pointer border-t border-slate-100 mt-1 pt-2"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Delete Message</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {message.isDeleted ? (
                <div className="flex items-center gap-1.5 italic text-slate-400 font-medium">
                  <Ban className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-xs sm:text-sm">This message was deleted</span>
                </div>
              ) : (
                <>
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="max-w-[220px] sm:max-w-[280px] w-full rounded-xl mb-2 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                      onClick={() => window.open(message.image, "_blank")}
                    />
                  )}
                  {message.text && (
                    <p className="text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere">
                      {message.text}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ChatMessageItem.displayName = "ChatMessageItem";

export default ChatMessageItem;
