import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import toast from "react-hot-toast";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import GroupTimeoutBanner from "./GroupTimeoutBanner";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import ForwardModal from "./ForwardModal";
import ChatMessageItem from "./ChatMessageItem";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { confirmDelete } from "../lib/confirmToast";
import { useDeleteAnimationStore } from "../store/useDeleteAnimationStore";

const ChatContainer = ({ isSidebarCollapsed, setIsSidebarCollapsed }) => {
  const theme = useThemeStore((state) => state.theme);
  const isNeubrutalism = theme === "neubrutalism";
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
  } = useChatStore();

  const {
    selectedGroup,
    activeTimeout,
    groupMessages,
    isGroupMessagesLoading,
  } = useGroupStore();

  const { authUser } = useAuthStore();
  const triggerDeleteAnimation = useDeleteAnimationStore((state) => state.triggerDeleteAnimation);

  const messageEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const scrollContentRef = useRef(null);
  const lenisRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  const [showScrollBottomButton, setShowScrollBottomButton] = useState(false);
  const [activeMenuMessageId, setActiveMenuMessageId] = useState(null);
  const [forwardModalMessage, setForwardModalMessage] = useState(null);
  const touchTimerRef = useRef(null);

  const isGroupMode = Boolean(selectedGroup);
  const currentMessages = isGroupMode ? groupMessages : messages;
  const isLoading = isGroupMode ? isGroupMessagesLoading : isMessagesLoading;

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottomButton(distanceToBottom > 150);
  }, []);

  // Initialize Lenis Smooth Scroll on chat message container
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const lenis = new Lenis({
      wrapper: scrollContainerRef.current,
      content: scrollContentRef.current || scrollContainerRef.current.firstElementChild,
      smoothWheel: true,
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    lenis.on("scroll", () => {
      handleScroll();
    });

    let rafId;
    function update(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(update);
    }
    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [handleScroll]);

  // Optimized scroll to bottom using Lenis or native scroll fallback
  const scrollToBottom = useCallback((behavior = "smooth") => {
    requestAnimationFrame(() => {
      const isInstant = behavior === "instant" || behavior === "auto";
      if (lenisRef.current) {
        lenisRef.current.scrollTo("bottom", {
          duration: isInstant ? 0 : 0.6,
          immediate: isInstant,
        });
      }
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    });
  }, []);

  // Reset initial load state when conversation changes
  useEffect(() => {
    isInitialLoadRef.current = true;
    setShowScrollBottomButton(false);
  }, [selectedUser?._id, selectedGroup?._id]);

  // Handle scroll to bottom on initial chat load and new messages
  useLayoutEffect(() => {
    if (!isLoading && currentMessages && currentMessages.length > 0) {
      if (isInitialLoadRef.current) {
        scrollToBottom("instant");
        isInitialLoadRef.current = false;
      } else if (!showScrollBottomButton) {
        scrollToBottom("smooth");
      }
    }
  }, [currentMessages, isLoading, scrollToBottom, showScrollBottomButton]);

  // Handle direct 1-on-1 messages subscription
  useEffect(() => {
    if (selectedUser?._id && !selectedGroup) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, selectedGroup, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Close context dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuMessageId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleTouchStart = useCallback((msg) => {
    if (msg.isDeleted) return;
    touchTimerRef.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(35);
      setActiveMenuMessageId(msg._id);
    }, 450);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  }, []);

  const handleCopyText = useCallback((text) => {
    navigator.clipboard.writeText(text);
    toast.success("Message copied to clipboard!");
    setActiveMenuMessageId(null);
  }, []);

  const handleForwardMessage = useCallback((msg) => {
    setForwardModalMessage(msg);
    setActiveMenuMessageId(null);
  }, []);

  const handleDeleteMessage = useCallback(async (msg) => {
    setActiveMenuMessageId(null);
    const confirmed = await confirmDelete({
      title: "Delete Message?",
      message: "Are you sure you want to delete this message? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (confirmed) {
      await triggerDeleteAnimation(msg.text || "Attachment");
      deleteMessage(msg._id);
    }
  }, [confirmDelete, triggerDeleteAnimation, deleteMessage]);

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
    <div className={`flex-1 flex flex-col h-full relative transition-all ${
      isNeubrutalism
        ? "bg-[#FFFDF0] text-black"
        : "bg-gradient-to-br from-slate-50/50 via-blue-50/40 to-sky-50/50"
    }`}>
      <ChatHeader
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

      {/* Group Timeout Banner */}
      {isGroupMode && activeTimeout?.isTimedOut && activeTimeout?.until && (
        <GroupTimeoutBanner until={activeTimeout.until} />
      )}

      {/* Scrollable Messages Area */}
      <div className="flex-1 relative min-h-0">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`h-full overflow-y-auto p-4 sm:p-6 transition-all ${
            isNeubrutalism
              ? "bg-[#FFFDF0]"
              : "bg-gradient-to-br from-sky-50/20 via-blue-50/30 to-slate-50/20"
          }`}
        >
          <div ref={scrollContentRef} className="space-y-4 flex flex-col justify-end min-h-full">
            {!currentMessages || currentMessages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center h-full px-4 min-h-[300px]">
                <div className={`text-center p-6 lg:p-8 max-w-sm lg:max-w-md w-full transition-all ${
                  isNeubrutalism
                    ? "bg-white border-4 border-black shadow-[6px_6px_0_#000] rounded-none text-black font-bold"
                    : "bg-white/70 backdrop-blur-xl rounded-2xl shadow-xs border border-sky-100 text-gray-600"
                }`}>
                  <div className={`w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 flex items-center justify-center ${
                    isNeubrutalism
                      ? "bg-[#FFE600] border-2 border-black shadow-[2px_2px_0_#000] rounded-none text-black"
                      : "bg-gradient-to-br from-blue-100 to-sky-100 rounded-full text-blue-600"
                  }`}>
                    <svg className="w-6 h-6 lg:w-8 lg:h-8 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className={isNeubrutalism ? "text-lg font-black mb-1 text-black uppercase" : "text-lg font-bold mb-1 text-gray-800"}>No messages yet</p>
                  <p className={isNeubrutalism ? "text-xs font-bold text-black/80" : "text-xs text-gray-500"}>
                    {isGroupMode
                      ? `Send a message to start chatting in ${selectedGroup?.name}!`
                      : `Send a message to start chatting with ${selectedUser?.fullName}!`}
                  </p>
                </div>
              </div>
            ) : (
              currentMessages.map((message, index) => {
                const isLastMessage = index === currentMessages.length - 1;

                const senderIdStr = (message.senderId?._id || message.senderId)?.toString();
                const isOwnMessage = senderIdStr === authUser._id.toString();
                const prevSenderIdStr =
                  index > 0
                    ? (currentMessages[index - 1].senderId?._id || currentMessages[index - 1].senderId)?.toString()
                    : null;
                const showAvatar = index === 0 || prevSenderIdStr !== senderIdStr;

                const senderPic = isOwnMessage
                  ? authUser.profilePic || "/avatar.png"
                  : message.senderId?.profilePic || selectedUser?.profilePic || "/avatar.png";
                const senderName = isOwnMessage
                  ? authUser.fullName
                  : message.senderId?.fullName || selectedUser?.fullName || "Group Member";

                return (
                  <ChatMessageItem
                    key={message._id}
                    message={message}
                    isLastMessage={isLastMessage}
                    isOwnMessage={isOwnMessage}
                    showAvatar={showAvatar}
                    senderPic={senderPic}
                    senderName={senderName}
                    isGroupMode={isGroupMode}
                    activeMenuMessageId={activeMenuMessageId}
                    setActiveMenuMessageId={setActiveMenuMessageId}
                    onCopy={handleCopyText}
                    onForward={handleForwardMessage}
                    onDelete={handleDeleteMessage}
                    handleTouchStart={handleTouchStart}
                    handleTouchEnd={handleTouchEnd}
                    messageEndRef={messageEndRef}
                  />
                );
              })
            )}
            <div ref={messageEndRef} />
          </div>
        </div>

        {/* Floating Scroll to Bottom Arrow Button */}
        <AnimatePresence>
          {showScrollBottomButton && (
            <motion.button
              initial={{ opacity: 0, y: 12, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.85 }}
              transition={{ duration: 0.2 }}
              onClick={() => scrollToBottom("smooth")}
              className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-30 p-2.5 transition-all cursor-pointer group flex items-center justify-center ${
                isNeubrutalism
                  ? "bg-[#FFE600] text-black border-2 border-black shadow-[3px_3px_0_#000] rounded-none font-bold hover:bg-yellow-200"
                  : "bg-white/90 backdrop-blur-xl border border-sky-200 text-blue-600 rounded-full shadow-lg shadow-blue-500/10 hover:bg-blue-50 hover:scale-110 active:scale-95"
              }`}
              title="Scroll to bottom"
            >
              <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform stroke-[2.5]" />
            </motion.button>
          )}
        </AnimatePresence>
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