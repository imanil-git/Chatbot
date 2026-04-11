import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types/chat.types';

export const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
        <ReactMarkdown className="prose prose-invert max-w-none text-sm">
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
