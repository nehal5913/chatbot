import React, { useState, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onVoiceInput: () => void;
  isLoading: boolean;
  isListening: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSubmit,
  onVoiceInput,
  isLoading,
  isListening,
  inputRef
}) => {
  const { fontSize } = useSettings();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fontSizeClass = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }[fontSize];

  // Mock suggestions based on input
  useEffect(() => {
    if (value.length > 2) {
      const mockSuggestions = [
        'How do I authenticate with OAuth 2.0?',
        'What are the API rate limits?',
        'Show me the database schema for users',
        'Explain the security protocols',
        'What are the system requirements?'
      ].filter(suggestion => 
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(mockSuggestions);
      setShowSuggestions(mockSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => selectSuggestion(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors border-b border-neutral-100 dark:border-neutral-700 last:border-b-0 ${fontSizeClass}`}
            >
              <span className="text-neutral-900 dark:text-white">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative flex items-end">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => value.length > 2 && setShowSuggestions(suggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Ask about your technical documents..."
            rows={1}
            className={`w-full px-4 py-3 pr-12 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors ${fontSizeClass}`}
            style={{
              minHeight: '52px',
              maxHeight: '120px'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
            disabled={isLoading}
          />
          
          <button
            type="button"
            onClick={onVoiceInput}
            disabled={isLoading}
            className={`absolute right-3 bottom-3 p-2 rounded-full transition-colors ${
              isListening
                ? 'text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/20'
                : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600'
            }`}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={!value.trim() || isLoading}
          className={`p-3 bg-primary-600 text-white rounded-lg transition-colors flex-shrink-0 ${
            !value.trim() || isLoading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-primary-700 active:bg-primary-800'
          }`}
          style={{ height: '52px', width: '52px' }}
          title="Send message"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;