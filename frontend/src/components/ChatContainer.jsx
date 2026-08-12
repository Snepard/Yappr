import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useEffect, useRef, useState } from "react";
import { Trash2, Ban, ChevronDown, Copy, Forward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import GroupTimeoutBanner from "./GroupTimeoutBanner";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import ForwardModal from "./ForwardModal";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { confirmDelete } from "../lib/confirmToast";
import { useDeleteAnimationStore } from "../store/useDeleteAnimationStore";

const ChatContainer = ({ isSidebarCollapsed, setIsSidebarCollapsed }) => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
  } = useChatStore();
  const { selectedGroup, activeTimeout } = useGroupStore();
  const { authUser, socket } = useAuthStore();
  const triggerDeleteAnimation = useDeleteAnimationStore((state) => state.triggerDeleteAnimation);
  
  const [groupMessages, setGroupMessages] = useState([]);
  const [isGroupMessagesLoading, setIsGroupMessagesLoading] = useState(false);

  const messageEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const [activeMenuMessageId, setActiveMenuMessageId] = useState(null);
  const [forwardModalMessage, setForwardModalMessage] = useState(null);
  const touchTimerRef = useRef(null);

  const isGroupMode = Boolean(selectedGroup);
  const currentMessages = isGroupMode ? groupMessages : messages;
  const isLoading = isGroupMode ? isGroupMessagesLoading : isMessagesLoading;

  // Fetch Group Messages when selectedGroup changes
  useEffect(() => {
    if (!selectedGroup) return;

    const fetchGroupMessages = async () => {
      setIsGroupMessagesLoading(true);
      try {
        const res = await axiosInstance.get(`/messages/group/${selectedGroup._id}`);
        setGroupMessages(res.data);
      } catch (err) {
        toast.error("Failed to load group messages");
      } finally {
        setIsGroupMessagesLoading(false);
      }
    };

    fetchGroupMessages();
  }, [selectedGroup?._id]);

  // Subscribe to real-time group message events
  useEffect(() => {
    if (!socket || !selectedGroup) return;

    const handleNewGroupMessage = (msg) => {
      if (msg.groupId?.toString() === selectedGroup._id.toString()) {
        setGroupMessages((prev) => [...prev, msg]);
      }
    };

    const handleGroupMessageDeleted = ({ messageId, groupId }) => {
      if (groupId?.toString() === selectedGroup._id.toString()) {
        setGroupMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? { ...msg, isDeleted: true, text: "This message was deleted", image: "" }
              : msg
          )
        );
      }
    };

    socket.on("newGroupMessage", handleNewGroupMessage);
    socket.on("messageDeleted", handleGroupMessageDeleted);

    return () => {
      socket.off("newGroupMessage", handleNewGroupMessage);
      socket.off("messageDeleted", handleGroupMessageDeleted);
    };
  }, [socket, selectedGroup?._id]);

  // Close dropdown menu on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenuMessageId(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Long press handler for mobile touch devices
  const handleTouchStart = (msg) => {
    if (msg.isDeleted) return;
    touchTimerRef.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(35);
      setActiveMenuMessageId(msg._id);
    }, 450);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  // Robust Auto-scroll to extreme bottom when messages update
  const scrollToBottom = (behavior = "smooth") => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior, block: "end" });
    }
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom("smooth");

    // Multiple ticks to account for DOM rendering & image attachment loading
    const timeoutId1 = setTimeout(() => scrollToBottom("smooth"), 60);
    const timeoutId2 = setTimeout(() => scrollToBottom("auto"), 220);

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
    };
  }, [currentMessages]);

  useEffect(() => {
    if (selectedUser?._id && !selectedGroup) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }

    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, selectedGroup, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <ChatHeader
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />
        <div className="flex-1 overflow-hidden">
          <MessageSkeleton />
        </div>
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-slate-50/50 via-blue-50/40 to-sky-50/50">
      <ChatHeader
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

      {/* Timeout Countdown Banner for Group Chat */}
      {isGroupMode && activeTimeout?.isTimedOut && activeTimeout?.until && (
        <GroupTimeoutBanner until={activeTimeout.until} />
      )}

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-br from-sky-50/20 via-blue-50/30 to-slate-50/20"
      >
        {!currentMessages || currentMessages?.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-600 h-full px-4 min-h-[300px]">
            <div className="text-center bg-white/70 backdrop-blur-xl rounded-2xl p-6 lg:p-8 shadow-sm border border-sky-100 max-w-sm lg:max-w-md w-full">
              <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 bg-gradient-to-br from-blue-100 to-sky-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-lg font-bold mb-1 text-gray-800">No messages yet</p>
              <p className="text-xs text-gray-500">
                {isGroupMode
                  ? `Send a message to start chatting in ${selectedGroup?.name}!`
                  : `Send a message to start chatting with ${selectedUser?.fullName}!`}
              </p>
            </div>
          </div>
        ) : (
          currentMessages?.map((message, index) => {
            const isLastMessage = index === currentMessages.length - 1;

            if (message.isSystemMessage) {
              return (
                <div
                  key={message._id}
                  ref={isLastMessage ? messageEndRef : null}
                  className="flex justify-center my-2.5 w-full"
                >
                  <div className="bg-sky-100/90 backdrop-blur-xs border border-sky-200/70 text-slate-700 text-xs font-semibold px-4 py-1.5 rounded-full shadow-2xs text-center max-w-xs sm:max-w-md ring-1 ring-sky-400/20">
                    {message.text}
                  </div>
                </div>
              );
            }

            const senderIdStr = (message.senderId?._id || message.senderId)?.toString();
            const isOwnMessage = senderIdStr === authUser._id.toString();
            const prevSenderIdStr = index > 0 ? (currentMessages[index - 1].senderId?._id || currentMessages[index - 1].senderId)?.toString() : null;
            const showAvatar = index === 0 || prevSenderIdStr !== senderIdStr;

            const senderPic = isOwnMessage
              ? authUser.profilePic || "/avatar.png"
              : (message.senderId?.profilePic || selectedUser?.profilePic || "/avatar.png");
            const senderName = isOwnMessage
              ? authUser.fullName
              : (message.senderId?.fullName || selectedUser?.fullName || "Group Member");
            
            return (
              <div
                key={message._id}
                className={`flex w-full group/msg ${isOwnMessage ? "justify-end" : "justify-start"} ${!showAvatar ? 'mt-1 sm:mt-1.5' : 'mt-3 sm:mt-4'}`}
                ref={isLastMessage ? messageEndRef : null}
              >
                <div className={`flex max-w-[85%] sm:max-w-md lg:max-w-xl ${isOwnMessage ? "flex-row-reverse" : "flex-row"} items-end gap-2 sm:gap-3`}>
                  {/* Avatar or spacer */}
                  <div className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 ${showAvatar ? '' : 'invisible'}`}>
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
                  
                  {/* Message content */}
                  <div className={`flex flex-col min-w-0 flex-1 ${isOwnMessage ? "items-end" : "items-start"}`}>
                    {showAvatar && (
                      <div className="text-[11px] text-gray-400 mb-1 px-1 font-medium flex items-center space-x-1.5">
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
                        className={`relative px-3.5 sm:px-4 py-2 sm:py-2.5 ${!message.isDeleted ? 'pr-7 sm:pr-8' : ''} rounded-2xl border shadow-xs min-w-[120px] max-w-full group/msgbubble ${
                          message.isDeleted
                            ? 'bg-slate-100/90 text-slate-400 border-slate-200/70 font-medium select-none'
                            : isOwnMessage 
                            ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white border-blue-400/30 rounded-br-xs' 
                            : 'bg-white text-gray-800 border-sky-100 rounded-bl-xs'
                        }`}
                      >
                        {/* WhatsApp-style Chevron Arrow Dropdown Trigger */}
                        {!message.isDeleted && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuMessageId((prev) => (prev === message._id ? null : message._id));
                            }}
                            className={`
                              absolute top-1.5 right-1.5 p-0.5 rounded-full backdrop-blur-xs transition-all duration-200 z-20 cursor-pointer
                              ${
                                isOwnMessage
                                  ? 'text-white/80 hover:text-white hover:bg-white/20'
                                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                              }
                              ${
                                activeMenuMessageId === message._id
                                  ? 'opacity-100 bg-white/20'
                                  : 'opacity-0 group-hover/msgbubble:opacity-100'
                              }
                            `}
                            title="Message options"
                          >
                            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        )}

                        {/* WhatsApp Options Context Dropdown Menu (Appears UPWARDS) */}
                        <AnimatePresence>
                          {activeMenuMessageId === message._id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.92, y: 8 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.92, y: 8 }}
                              transition={{ duration: 0.15, ease: "easeOut" }}
                              onClick={(e) => e.stopPropagation()}
                              className={`
                                absolute z-50 bottom-full mb-2 ${isOwnMessage ? 'right-0' : 'left-0'}
                                w-44 bg-white/95 backdrop-blur-xl border border-sky-100/90
                                shadow-2xl shadow-sky-500/15 rounded-2xl p-1.5 text-slate-800 ring-1 ring-sky-500/10
                              `}
                            >
                              {/* Copy Option */}
                              {message.text && (
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(message.text);
                                    toast.success("Message copied to clipboard!");
                                    setActiveMenuMessageId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-sky-50/80 rounded-xl transition-colors cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Copy Text</span>
                                </button>
                              )}

                              {/* Forward Option */}
                              <button
                                onClick={() => {
                                  setForwardModalMessage(message);
                                  setActiveMenuMessageId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-sky-50/80 rounded-xl transition-colors cursor-pointer"
                              >
                                <Forward className="w-3.5 h-3.5 text-sky-500" />
                                <span>Forward</span>
                              </button>

                              {/* Delete Option (Own Messages Only) */}
                              {isOwnMessage && (
                                <button
                                  onClick={async () => {
                                    setActiveMenuMessageId(null);
                                    const confirmed = await confirmDelete({
                                      title: "Delete Message?",
                                      message: "Are you sure you want to delete this message? This action cannot be undone.",
                                      confirmText: "Delete",
                                      cancelText: "Cancel",
                                    });
                                    if (confirmed) {
                                      await triggerDeleteAnimation(message.text || "Attachment");
                                      deleteMessage(message._id);
                                    }
                                  }}
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
                                onClick={() => window.open(message.image, '_blank')}
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
          })
        )}
        {/* Invisible div to scroll to */}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />

      {/* Forward Modal */}
      <ForwardModal
        isOpen={!!forwardModalMessage}
        onClose={() => setForwardModalMessage(null)}
        messageToForward={forwardModalMessage}
      />
    </div>
  );
};

export default ChatContainer;