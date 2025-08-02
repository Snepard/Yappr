import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      messageEndRef.current?.scrollIntoView({ 
        behavior: "smooth",
        block: "end" 
      });
    };

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages]);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }

    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <ChatHeader />
        <div className="flex-1 overflow-hidden">
          <MessageSkeleton />
        </div>
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 bg-gradient-to-br from-purple-50/30 via-blue-50/40 to-indigo-50/30">
        {!messages || messages?.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-600 min-h-[300px] sm:min-h-[400px] px-4">
            <div className="text-center bg-white/60 backdrop-blur-xl rounded-2xl p-6 lg:p-8 shadow-xl border border-white/20 max-w-sm lg:max-w-md w-full">
              <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 lg:w-8 lg:h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-lg lg:text-xl font-semibold mb-2 text-gray-800">No messages yet</p>
              <p className="text-sm text-gray-500">Send a message to start the conversation!</p>
            </div>
          </div>
        ) : (
          messages?.map((message, index) => {
            const isOwnMessage = message.senderId === authUser._id;
            const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
            const isLastMessage = index === messages.length - 1;
            
            return (
              <div
                key={message._id}
                className={`flex w-full ${isOwnMessage ? "justify-end" : "justify-start"} ${!showAvatar ? 'mt-1 sm:mt-2' : 'mt-3 sm:mt-4'}`}
                ref={isLastMessage ? messageEndRef : null}
              >
                <div className={`flex max-w-[85%] sm:max-w-xs lg:max-w-md xl:max-w-lg ${isOwnMessage ? "flex-row-reverse" : "flex-row"} items-end gap-2 sm:gap-3`}>
                  {/* Avatar or spacer */}
                  <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 ${showAvatar ? '' : 'invisible'}`}>
                    {showAvatar && (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white/50 overflow-hidden shadow-lg">
                        <img
                          src={
                            isOwnMessage
                              ? authUser.profilePic || "/avatar.png"
                              : selectedUser.profilePic || "/avatar.png"
                          }
                          alt="profile pic"
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
                      <div className={`text-xs text-gray-500 mb-1 px-1 font-medium`}>
                        {formatMessageTime(message.createdAt)}
                      </div>
                    )}
                    
                    <div className={`relative px-3 sm:px-4 py-2 sm:py-3 rounded-2xl backdrop-blur-md border shadow-lg transform transition-all duration-200 hover:scale-[1.02] min-w-0 max-w-full ${
                      isOwnMessage 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-400/30 rounded-br-md shadow-blue-200/50' 
                        : 'bg-white/80 text-gray-800 border-gray-200/50 rounded-bl-md shadow-gray-200/50'
                    }`}>
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Attachment"
                          className="max-w-[200px] sm:max-w-[250px] w-full rounded-xl mb-2 sm:mb-3 cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
                          onClick={() => window.open(message.image, '_blank')}
                        />
                      )}
                      {message.text && (
                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere">
                          {message.text}
                        </p>
                      )}
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
    </div>
  );
};

export default ChatContainer;