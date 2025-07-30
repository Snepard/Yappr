import { MessageSquare, Users, Zap } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-gradient-to-br from-base-100 to-base-200/30">
      <div className="max-w-md text-center space-y-8">
        {/* Icon Display */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 
                           flex items-center justify-center shadow-lg backdrop-blur-sm
                           animate-pulse hover:animate-none transition-all duration-300
                           hover:scale-105 hover:shadow-xl">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
            
            {/* Floating decorative elements */}
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-secondary/20 
                           flex items-center justify-center animate-bounce delay-100">
              <Users className="w-3 h-3 text-secondary" />
            </div>
            
            <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-accent/20 
                           flex items-center justify-center animate-bounce delay-200">
              <Zap className="w-3 h-3 text-accent" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary 
                         bg-clip-text text-transparent">
            Welcome to Yappr!
          </h2>
          
          <p className="text-base-content/70 text-lg leading-relaxed">
            Select a conversation from the sidebar to start chatting with your friends
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 gap-4 mt-8 pt-6 border-t border-base-300/50">
          <div className="flex items-center gap-3 text-base-content/60">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm">Real-time messaging</span>
          </div>
          
          <div className="flex items-center gap-3 text-base-content/60">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-secondary" />
            </div>
            <span className="text-sm">See who's online</span>
          </div>
          
          <div className="flex items-center gap-3 text-base-content/60">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <span className="text-sm">Share images instantly</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;