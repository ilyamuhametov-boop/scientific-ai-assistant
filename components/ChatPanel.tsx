import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AppState } from '../types';
import { Message } from './Message';
import { SendIcon, LoadingIcon } from './Icons';

type ModelOption = { id: string; label: string };

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, useGrounding?: boolean, isContextFree?: boolean) => void;
  appState: AppState;
  isPdfLoaded: boolean;
  modelOptions: ModelOption[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  appState,
  isPdfLoaded,
  modelOptions,
  selectedModel,
  onModelChange,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const isInputDisabled = appState === AppState.GENERATING || appState === AppState.PROCESSING_PDF;
  const isModelSelectDisabled = appState === AppState.PROCESSING_PDF;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isInputDisabled) {
      // Send as context-free if no PDF is loaded
      onSendMessage(input.trim(), false, !isPdfLoaded);
      setInput('');
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        {appState === AppState.GENERATING && (
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                    <LoadingIcon className="w-6 h-6 animate-spin"/>
                </div>
                <div className="flex-1 pt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Модель отвечает...</p>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm text-gray-700 dark:text-gray-300">
            <label htmlFor="model-select" className="font-medium">
              Модель LLM
            </label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              disabled={isModelSelectDisabled}
              className="w-full md:w-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            >
              {modelOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <form onSubmit={handleSubmit} className="flex items-center space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isPdfLoaded ? "Задайте вопрос об открытой статье..." : "Задайте вопрос или начните черновик..."}
              disabled={isInputDisabled}
              className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isInputDisabled || !input.trim()}
              className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};
