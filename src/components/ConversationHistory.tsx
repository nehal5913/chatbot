import React, { useState } from 'react';
import { MessageSquare, Search, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useSettings } from '../context/SettingsContext';

const ConversationHistory: React.FC = () => {
  const { conversations, currentConversationId, createNewConversation, selectConversation, deleteConversation } = useChat();
  const { fontSize } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.messages.some(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const fontSizeClass = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }[fontSize];

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 flex flex-col items-center py-4 transition-all duration-300">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={createNewConversation}
          className="mt-4 p-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          title="New conversation"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-semibold text-neutral-900 dark:text-white ${fontSizeClass}`}>
            Conversations
          </h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={createNewConversation}
              className="p-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              title="New conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-2 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${fontSizeClass}`}
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-neutral-500 dark:text-neutral-400">
            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <p className={`text-center ${fontSizeClass}`}>
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!searchTerm && (
              <button
                onClick={createNewConversation}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Start chatting
              </button>
            )}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                currentConversationId === conversation.id
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'
              }`}
              onClick={() => selectConversation(conversation.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-neutral-900 dark:text-white truncate ${fontSizeClass}`}>
                    {conversation.title}
                  </h3>
                  <p className={`text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 ${
                    fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm'
                  }`}>
                    {conversation.messages.length > 0 
                      ? conversation.messages[conversation.messages.length - 1].content.slice(0, 100) + '...'
                      : 'No messages yet'
                    }
                  </p>
                  <p className={`text-neutral-400 dark:text-neutral-500 mt-2 ${
                    fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-sm' : 'text-xs'
                  }`}>
                    {conversation.updatedAt.toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conversation.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-all"
                  title="Delete conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              {/* Message count indicator */}
              <div className="absolute top-2 right-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300`}>
                  {conversation.messages.length}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tips */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700/50">
        <div className={`text-neutral-600 dark:text-neutral-300 ${
          fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-sm' : 'text-xs'
        }`}>
          <p className="font-medium mb-1">💡 Quick Tips:</p>
          <ul className="space-y-1">
            <li>• Ask specific questions about your documents</li>
            <li>• Reference document sections for precise answers</li>
            <li>• Use feedback buttons to improve responses</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConversationHistory;