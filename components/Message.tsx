import React from 'react';
import { ChatMessage } from '../types';
import { UserIcon, BotIcon } from './Icons';
import { formatMarkdown } from '../utils/markdown';

interface MessageProps {
  message: ChatMessage;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  // Use the utility function for formatting
  const formattedHtml = formatMarkdown(message.text);

  return (
    <div className={`flex items-start space-x-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
          <BotIcon className="w-6 h-6" />
        </div>
      )}

      <div className={`max-w-xl p-4 rounded-lg shadow-sm ${isUser ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}>
        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: formattedHtml }} />
      </div>

      {isUser && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
          <UserIcon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};
