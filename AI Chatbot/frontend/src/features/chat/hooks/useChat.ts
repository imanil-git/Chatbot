import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types/chat.types';
import { streamChat } from '../api/chat.api';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim()) return;

    const userMessage: Message = { id: uuidv4(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    setIsStreaming(true);
    let assistantMessageId = uuidv4();
    
    setMessages(prev => [
      ...prev,
      { id: assistantMessageId, role: 'assistant', content: '' }
    ]);

    try {
      await streamChat(input, (token) => {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId
            ? { ...msg, content: msg.content + token }
            : msg
        ));
      });
    } catch (error) {
      console.error('Chat stream error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId
          ? { ...msg, content: 'Error communicating with AI. Please try again.' }
          : msg
      ));
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return { messages, sendMessage, isStreaming };
};
