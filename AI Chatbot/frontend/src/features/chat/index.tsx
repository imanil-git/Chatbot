import React, { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Dummy interfaces for now
interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      role: 'ai',
      content: 'Hello! I am your Antigravity Assistant powered by LangChain. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate LangChain streaming/API call delay
    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `Here is a simulated response to: *"${userMsg.content}"*\n\n### Code Example\n\`\`\`javascript\nconst a = 10;\nconsole.log(a);\n\`\`\`\n\nI can process markdown like **bold** or lists!`
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex-1 bg-card border border-border-subtle rounded-xl flex flex-col shadow-2xl overflow-hidden relative">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle bg-surface/50 backdrop-blur-sm z-10 sticky top-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shadow-[0_0_15px_rgba(var(--color-primary),0.3)]">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="text-white font-bold tracking-wide">LangChain Assistant</h2>
            <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat bg-opacity-5 relative">
        {/* Subtle radial gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface/40 pointer-events-none" />

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', bounce: 0.35, duration: 0.5 }}
              className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className="flex-shrink-0 mt-1">
                  {message.role === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                      <UserIcon size={16} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-card border border-border-subtle flex items-center justify-center text-primary shadow-md">
                      <Bot size={18} />
                    </div>
                  )}
                </div>

                {/* Bubble content */}
                <div 
                  className={`px-5 py-3.5 rounded-2xl shadow-sm ${
                    message.role === 'user' 
                      ? 'bg-primary text-white font-medium break-words rounded-tr-sm' 
                      : 'bg-surface border border-border-subtle text-text rounded-tl-sm'
                  }`}
                >
                  {message.role === 'user' ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-[#1e1e2e] prose-pre:border prose-pre:border-border-subtle markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex justify-start w-full"
          >
            <div className="flex gap-3 max-w-[85%]">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-card border border-border-subtle flex items-center justify-center text-primary shadow-md">
                  <Bot size={18} />
                </div>
              </div>
              <div className="px-5 py-3.5 rounded-2xl rounded-tl-sm bg-surface border border-border-subtle flex items-center gap-1 shadow-sm h-[48px]">
                <motion.div className="w-2 h-2 rounded-full bg-primary" animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
                <motion.div className="w-2 h-2 rounded-full bg-primary" animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                <motion.div className="w-2 h-2 rounded-full bg-primary" animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface border-t border-border-subtle z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-end max-w-4xl mx-auto bg-card rounded-2xl border border-border-subtle focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all shadow-inner overflow-hidden"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            disabled={isTyping}
            rows={1}
            autoFocus
            className="w-full max-h-[200px] min-h-[56px] py-4 pl-5 pr-14 bg-transparent border-none focus:ring-0 resize-none text-white placeholder-muted disabled:opacity-50 !outline-none"
            style={{ 
              maxHeight: '200px',
              height: Math.min(200, Math.max(56, input.split('\n').length * 24 + 32)) + 'px'
            }}
          />
          <div className="absolute right-2 bottom-2">
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                input.trim() && !isTyping 
                  ? 'bg-primary text-white hover:bg-primary-dark hover:scale-105 active:scale-95 shadow-md shadow-primary/30' 
                  : 'bg-surface border border-border-subtle text-muted disabled:cursor-not-allowed'
              }`}
            >
              <Send size={18} className={input.trim() && !isTyping ? "translate-x-0.5 -translate-y-0.5" : ""} />
            </button>
          </div>
        </form>
        <div className="text-center mt-2">
          <p className="text-[10px] text-muted-dark font-medium uppercase tracking-widest flex items-center justify-center gap-1">
            <Bot size={10} /> Powered by LangChain Model
          </p>
        </div>
      </div>
    </div>
  );
};
