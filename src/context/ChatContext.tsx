import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Citation {
  documentId: string;
  documentName: string;
  section: string;
  page?: number;
  snippet: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Citation[];
  feedback?: 'helpful' | 'not-helpful';
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  currentConversation: Conversation | null;
  isLoading: boolean;
  createNewConversation: () => void;
  selectConversation: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  setMessageFeedback: (messageId: string, feedback: 'helpful' | 'not-helpful') => void;
  deleteConversation: (id: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'welcome',
      title: 'Welcome to Tech Spec Reader',
      messages: [
        {
          id: 'welcome-msg',
          role: 'assistant',
          content: `Welcome to Tech Spec Reader! 🚀

I'm here to help you understand your technical documentation. Here's what I can do:

## 📚 Document Analysis
- Answer questions about your uploaded documents
- Provide citations and references to source material
- Explain complex technical concepts in simple terms

## 🔍 Smart Search
- Search through multiple documents simultaneously
- Find relevant information across your entire document library
- Connect to NAS drives for enterprise document access

## 💡 Getting Started
1. **Upload Documents**: Use the document manager above to upload your tech specs
2. **Ask Questions**: Type your questions about the documents
3. **Get Answers**: Receive detailed responses with source citations

Try asking me something like "How do I authenticate with the API?" or "What are the database requirements?"`,
          timestamp: new Date(),
          citations: []
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentConversation = conversations.find(conv => conv.id === currentConversationId) || null;

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
  };

  const selectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const generateAIResponse = async (userMessage: string): Promise<Message> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Generate mock citations
    const mockCitations: Citation[] = [
      {
        documentId: '1',
        documentName: 'API Documentation v2.1',
        section: 'Authentication Methods',
        page: 15,
        snippet: 'The API supports both OAuth 2.0 and API key authentication methods for secure access...'
      },
      {
        documentId: '2',
        documentName: 'Database Schema Guide',
        section: 'User Management',
        page: 8,
        snippet: 'User authentication data is stored in the users table with encrypted password fields...'
      }
    ];

    // Generate contextual response based on user message
    let responseContent = '';
    if (userMessage.toLowerCase().includes('authentication') || userMessage.toLowerCase().includes('auth')) {
      responseContent = `Based on the technical documentation, there are several authentication methods supported:

## Primary Authentication Methods

1. **OAuth 2.0** - Recommended for web applications
   - Supports authorization code flow
   - Refresh token rotation enabled
   - Scopes: read, write, admin

2. **API Key Authentication** - For server-to-server communication
   - Include in header: \`Authorization: Bearer YOUR_API_KEY\`
   - Keys can be scoped to specific resources
   - Rate limiting: 1000 requests/hour

## Implementation Examples

\`\`\`javascript
// OAuth 2.0 Example
const authUrl = 'https://api.example.com/oauth/authorize';
window.location.href = \`\${authUrl}?client_id=YOUR_CLIENT_ID&response_type=code\`;

// API Key Example
fetch('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
\`\`\`

Both methods provide secure access to the system with different use cases and security considerations.`;
    } else if (userMessage.toLowerCase().includes('database') || userMessage.toLowerCase().includes('schema')) {
      responseContent = `The database schema includes several key components:

## Core Tables

| Table Name | Purpose | Key Fields |
|------------|---------|------------|
| users | User management | id, email, encrypted_password, created_at |
| sessions | Active sessions | id, user_id, token, expires_at |
| audit_logs | Security tracking | id, user_id, action, timestamp |

## Security Features

- **Encryption**: All sensitive data encrypted at rest
- **Indexing**: Optimized queries on frequently accessed fields  
- **Constraints**: Foreign key relationships maintained
- **Backup**: Automated daily backups with 30-day retention

The schema supports horizontal scaling and includes migration scripts for version updates.`;
    } else {
      responseContent = `I understand you're asking about "${userMessage}". Based on the technical specifications in your documents, here's what I found:

This appears to be related to system architecture and implementation details. The documentation covers several aspects:

- **Configuration parameters** for system setup
- **Integration guidelines** for connecting with external services  
- **Performance specifications** and optimization recommendations
- **Security protocols** and best practices

Could you provide more specific details about what aspect you'd like me to focus on? I can dive deeper into any particular section or provide more targeted information based on the exact specifications you need.`;
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: responseContent,
      timestamp: new Date(),
      citations: mockCitations
    };
  };

  const sendMessage = async (content: string) => {
    if (!currentConversationId) {
      createNewConversation();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    // Add user message
    setConversations(prev => prev.map(conv => 
      conv.id === currentConversationId
        ? { 
            ...conv, 
            messages: [...conv.messages, userMessage],
            updatedAt: new Date(),
            title: conv.messages.length === 0 ? content.slice(0, 50) + (content.length > 50 ? '...' : '') : conv.title
          }
        : conv
    ));

    setIsLoading(true);
    
    try {
      const aiResponse = await generateAIResponse(content);
      
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId
          ? { 
              ...conv, 
              messages: [...conv.messages, aiResponse],
              updatedAt: new Date()
            }
          : conv
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const setMessageFeedback = (messageId: string, feedback: 'helpful' | 'not-helpful') => {
    setConversations(prev => prev.map(conv => 
      conv.id === currentConversationId
        ? {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.id === messageId ? { ...msg, feedback } : msg
            )
          }
        : conv
    ));
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (currentConversationId === id) {
      const remaining = conversations.filter(conv => conv.id !== id);
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversationId,
      currentConversation,
      isLoading,
      createNewConversation,
      selectConversation,
      sendMessage,
      setMessageFeedback,
      deleteConversation
    }}>
      {children}
    </ChatContext.Provider>
  );
};