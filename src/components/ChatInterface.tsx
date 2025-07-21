import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useSettings } from '../context/SettingsContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatInterface: React.FC = () => {
  const { currentConversation, isLoading, sendMessage, createNewConversation } = useChat();
  const { fontSize } = useSettings();
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const fontSizeClass = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }[fontSize];

  useEffect(() => {
    if (!currentConversation) {
      createNewConversation();
    }
  }, [currentConversation, createNewConversation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      const message = inputValue.trim();
      setInputValue('');
      await sendMessage(message);
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev + transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Speech recognition not supported in this browser');
    }
  };

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className={`text-gray-600 dark:text-gray-300 ${fontSizeClass}`}>
            Initializing chat...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300 overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={currentConversation.messages} />
      </div>

      {/* Input Area */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 transition-colors duration-300 flex-shrink-0">
        <MessageInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          onVoiceInput={handleVoiceInput}
          isLoading={isLoading}
          isListening={isListening}
          inputRef={inputRef}
        />
        
        {/* Quick suggestions */}
        {currentConversation.messages.length === 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              'How do I authenticate with the API?',
              'What are the database schema requirements?',
              'Show me the rate limiting configuration',
              'Explain the security protocols'
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInputValue(suggestion)}
                className={`px-3 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors ${
                  fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-base' : 'text-sm'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;