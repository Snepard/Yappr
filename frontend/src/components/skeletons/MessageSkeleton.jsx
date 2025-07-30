const MessageSkeleton = () => {
  // Create an array of 6 items for skeleton messages
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-50">
      {skeletonMessages.map((_, idx) => {
        const isOwnMessage = idx % 2 === 0;
        const messageWidth = Math.random() > 0.5 ? 'w-48' : 'w-32'; // Varying widths
        const hasImage = Math.random() > 0.7; // 30% chance of image skeleton
        
        return (
          <div key={idx} className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}>
            {/* Avatar */}
            <div className="chat-image avatar">
              <div className="w-8 h-8 rounded-full">
                <div className="skeleton w-full h-full rounded-full animate-pulse" />
              </div>
            </div>

            {/* Timestamp */}
            <div className="chat-header mb-1">
              <div className="skeleton h-3 w-12 animate-pulse" />
            </div>

            {/* Message Bubble */}
            <div className={`chat-bubble ${
              isOwnMessage ? 'chat-bubble-primary' : 'chat-bubble-secondary'
            } p-3 space-y-2`}>
              {/* Image skeleton (sometimes) */}
              {hasImage && (
                <div className="skeleton h-32 w-48 rounded-lg animate-pulse" />
              )}
              
              {/* Text lines */}
              <div className="space-y-2">
                <div className={`skeleton h-4 ${messageWidth} animate-pulse`} />
                {Math.random() > 0.5 && (
                  <div className="skeleton h-4 w-24 animate-pulse" />
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Loading indicator */}
      <div className="flex justify-center py-4">
        <div className="flex items-center gap-2 text-base-content/50">
          <div className="skeleton w-4 h-4 rounded-full animate-pulse" />
          <div className="skeleton w-4 h-4 rounded-full animate-pulse delay-100" />
          <div className="skeleton w-4 h-4 rounded-full animate-pulse delay-200" />
        </div>
      </div>
    </div>
  );
};

export default MessageSkeleton;