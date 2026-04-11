import React from 'react';
import { ChatWindow } from './features/chat';
import { useSession } from './features/session';

function App() {
  // Initialize session globally
  useSession();

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 sm:p-8 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
      
      <main className="w-full h-[90vh] md:h-[85vh] xl:max-w-6xl relative z-10 flex">
        <ChatWindow />
      </main>
    </div>
  );
}

export default App;
