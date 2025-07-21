import React, { useEffect, useRef } from 'react';
import { User, Bot, ThumbsUp, ThumbsDown, Copy, ExternalLink } from 'lucide-react';
import { Message } from '../context/ChatContext';
import { useChat } from '../context/ChatContext';
import { useSettings } from '../context/SettingsContext';
import MarkdownRenderer from './MarkdownRenderer';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const { setMessageFeedback, isLoading } = useChat();
  const { fontSize } = useSettings();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fontSizeClass = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }[fontSize];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleFeedback = (messageId: string, feedback: 'helpful' | 'not-helpful') => {
    setMessageFeedback(messageId, feedback);
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className={`font-semibold text-neutral-900 dark:text-white mb-4 ${fontSizeClass}`}>
            Welcome to Tech Spec Reader
          </h3>
          <p className={`text-neutral-600 dark:text-neutral-300 mb-6 ${fontSizeClass}`}>
            I'm here to help you understand your technical documentation. Upload your spec documents and ask me anything about them.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'API authentication methods',
              'Database configuration',
              'Security protocols', 
              'Performance specifications'
            ].map((topic) => (
              <div key={topic} className={`p-3 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 ${
                fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-base' : 'text-sm'
              }`}>
                <span className="text-neutral-700 dark:text-neutral-300">Ask about {topic}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex space-x-4 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.role === 'assistant' && (
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
          )}
          
          <div className={`max-w-3xl ${message.role === 'user' ? 'order-1' : ''}`}>
            <div
              className={`rounded-2xl px-6 py-4 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white'
              }`}
            >
              {message.role === 'user' ? (
                <p className={fontSizeClass}>{message.content}</p>
              ) : (
                <MarkdownRenderer content={message.content} />
              )}
              
              {/* Citations */}
              {message.citations && message.citations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                  <h4 className={`font-medium text-neutral-700 dark:text-neutral-300 mb-2 ${
                    fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-base' : 'text-sm'
                  }`}>
                    Sources:
                  </h4>
                  <div className="space-y-2">
                    {message.citations.map((citation, index) => (
                      <div
                        key={index}
                        className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg border-l-4 border-primary-500"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium text-neutral-900 dark:text-white ${
                            fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-base' : 'text-sm'
                          }`}>
                            {citation.documentName}
                          </span>
                          <button
                            className="flex items-center space-x-1 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
                            onClick={() => {/* Handle navigation to document */}}
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="text-xs">View</span>
                          </button>
                        </div>
                        <p className={`text-neutral-600 dark:text-neutral-300 ${
                          fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-sm' : 'text-xs'
                        }`}>
                          {citation.section}{citation.page && ` • Page ${citation.page}`}
                        </p>
                        <p className={`text-neutral-700 dark:text-neutral-200 mt-1 italic ${
                          fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-base' : 'text-sm'
                        }`}>
                          "{citation.snippet}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Message metadata and actions */}
            <div className="flex items-center justify-between mt-2 px-2">
              <span className={`text-neutral-500 dark:text-neutral-400 ${
                fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-sm' : 'text-xs'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </span>
              
              {message.role === 'assistant' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    title="Copy message"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleFeedback(message.id, 'helpful')}
                      className={`p-1 transition-colors ${
                        message.feedback === 'helpful'
                          ? 'text-secondary-600 dark:text-secondary-400'
                          : 'text-neutral-400 hover:text-secondary-600 dark:hover:text-secondary-400'
                      }`}
                      title="Helpful"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, 'not-helpful')}
                      className={`p-1 transition-colors ${
                        message.feedback === 'not-helpful'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-neutral-400 hover:text-red-600 dark:hover:text-red-400'
                      }`}
                      title="Not helpful"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {message.role === 'user' && (
            <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-600 rounded-full flex items-center justify-center flex-shrink-0 order-2">
              <User className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
            </div>
          )}
        </div>
      ))}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex space-x-4">
          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-6 py-4">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className={`text-neutral-500 dark:text-neutral-400 ${fontSizeClass}`}>
                Analyzing documents...
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;