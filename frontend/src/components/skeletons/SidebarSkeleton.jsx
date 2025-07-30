import { Users } from "lucide-react";

const SidebarSkeleton = ({ itemCount = 8 }) => {
  const skeletonContacts = Array(itemCount).fill(null);

  return (
    <aside
      className="h-full w-20 lg:w-72 bg-gradient-to-b from-slate-50 to-slate-100 
      border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out
      shadow-sm"
      aria-label="Loading contacts"
      aria-busy="true"
    >
      {/* Header with enhanced styling */}
      <div className="border-b border-slate-200 w-full p-5 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="hidden lg:block">
            <div className="h-4 w-20 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 
            rounded animate-pulse bg-[length:200%_100%] animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Enhanced Skeleton Contacts */}
      <div className="overflow-y-auto w-full py-4 px-2 space-y-1">
        {skeletonContacts.map((_, idx) => (
          <div
            key={idx}
            className="w-full p-3 flex items-center gap-3 rounded-xl 
            hover:bg-white/60 transition-colors duration-200 group"
            style={{
              animationDelay: `${idx * 150}ms`,
            }}
          >
            {/* Enhanced Avatar skeleton */}
            <div className="relative mx-auto lg:mx-0">
              <div className="size-12 rounded-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 
              animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                animate-shimmer bg-[length:200%_100%]" />
              </div>
              {/* Online status indicator skeleton */}
              <div className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full 
              bg-gradient-to-r from-green-200 to-green-300 border-2 border-white
              animate-pulse" />
            </div>

            {/* Enhanced User info skeleton - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0 flex-1 space-y-2">
              {/* Name skeleton */}
              <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 
              rounded animate-pulse relative overflow-hidden bg-[length:200%_100%]"
              style={{ width: `${Math.random() * 40 + 80}px` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent 
                animate-shimmer bg-[length:200%_100%]" />
              </div>
              
              {/* Status/message skeleton */}
              <div className="h-3 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 
              rounded animate-pulse relative overflow-hidden bg-[length:200%_100%]"
              style={{ width: `${Math.random() * 30 + 40}px` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent 
                animate-shimmer bg-[length:200%_100%]" />
              </div>
            </div>

            {/* Notification badge skeleton */}
            <div className="hidden lg:block">
              {Math.random() > 0.7 && (
                <div className="size-5 rounded-full bg-gradient-to-r from-blue-200 to-blue-300 
                animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Loading indicator at bottom */}
      <div className="p-4 border-t border-slate-200 bg-white/50">
        <div className="flex items-center justify-center gap-2">
          <div className="flex space-x-1">
            <div className="size-2 bg-blue-400 rounded-full animate-bounce" 
            style={{ animationDelay: "0ms" }} />
            <div className="size-2 bg-blue-400 rounded-full animate-bounce" 
            style={{ animationDelay: "150ms" }} />
            <div className="size-2 bg-blue-400 rounded-full animate-bounce" 
            style={{ animationDelay: "300ms" }} />
          </div>
          <span className="hidden lg:block text-xs text-slate-500 ml-2">Loading contacts...</span>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </aside>
  );
};

export default SidebarSkeleton;