import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export const ChatWindow: React.FC = () => {
  const { messages, sendMessage, isStreaming } = useChat();
  const [input, setInput] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isStreaming) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-gray-900 overflow-hidden shadow-2xl rounded-lg border border-gray-800 relative z-10">
      <header className="bg-gray-800/80 backdrop-blur-md px-6 py-4 border-b border-gray-700 flex items-center justify-between z-20">
        <div>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Antigravity AI</h1>
          <p className="text-xs text-gray-400 mt-0.5">Your intelligent assistant</p>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-50">
            <div className="w-16 h-16 mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <p className="text-lg">What can I help you with today?</p>
          </div>
        ) : (
          messages.map(msg => <MessageBubble key={msg.id} message={msg} />)
        )}
        
        {isStreaming && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="flex w-full justify-start mb-4">
            <TypingIndicator />
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-4 bg-gray-800/50 backdrop-blur-sm border-t border-gray-700 z-20">
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isStreaming}
            className="flex-1 bg-gray-900 border-gray-600 focus:border-blue-500 rounded-full px-6 py-3 shadow-inner"
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || isStreaming}
            variant="primary"
            className="rounded-full px-6 flex items-center justify-center min-w-[100px] shadow-lg hover:shadow-blue-500/25"
          >
            {isStreaming ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Send'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
