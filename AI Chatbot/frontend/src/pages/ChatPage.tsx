import React, { useState } from 'react';
import { ChatWindow } from '../features/chat';
import { useSession } from '../features/session';
import { useAuthStore, useLogout } from '../features/auth';

export const ChatPage: React.FC = () => {
  // Initialize session globally when accessing the chat expressly
  useSession();
  
  const user = useAuthStore(state => state.user);
  const { logout, isLoggingOut } = useLogout();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const initial = user?.username ? user.username.charAt(0).toUpperCase() : '?';

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-hidden relative">
      <header className="sticky top-0 z-50 bg-card border-b border-border-subtle px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-bold text-primary">Antigravity</div>
        
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-card"
          >
            {initial}
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border-subtle rounded-lg shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border-subtle">
                <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                <p className="text-xs text-muted truncate">{user?.email}</p>
              </div>
              <button 
                onClick={logout}
                disabled={isLoggingOut}
                className="w-full text-left px-4 py-3 text-sm text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
      
      <main className="flex-1 w-full h-[calc(100vh-73px)] xl:max-w-6xl mx-auto relative z-10 flex p-4 sm:p-8">
        <ChatWindow />
      </main>
    </div>
  );
};
