import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'text' | 'webpage' | 'manual';
  size: string;
  uploadDate: Date;
  source?: 'local' | 'nas';
  nasPath?: string;
}

export interface NASConnection {
  id: string;
  name: string;
  host: string;
  username: string;
  isConnected: boolean;
}

export interface SearchResult {
  id: string;
  name: string;
  type: string;
  size: string;
  nasPath: string;
}

interface DocumentContextType {
  documents: Document[];
  selectedDocuments: string[];
  nasConnections: NASConnection[];
  currentNAS: string | null;
  searchResults: SearchResult[];
  isSearching: boolean;
  addDocument: (doc: Omit<Document, 'id' | 'uploadDate'>) => void;
  removeDocument: (id: string) => void;
  toggleDocumentSelection: (id: string) => void;
  selectAllDocuments: () => void;
  deselectAllDocuments: () => void;
  addNASConnection: (nas: Omit<NASConnection, 'id' | 'isConnected'>) => void;
  connectToNAS: (id: string) => Promise<boolean>;
  disconnectFromNAS: (id: string) => void;
  searchNASDocuments: (keyword: string, nasId?: string) => Promise<void>;
  clearSearchResults: () => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [nasConnections, setNASConnections] = useState<NASConnection[]>([
    {
      id: '1',
      name: 'Main NAS Server',
      host: '192.168.1.100',
      username: 'admin',
      isConnected: false
    }
  ]);
  const [currentNAS, setCurrentNAS] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const addDocument = (doc: Omit<Document, 'id' | 'uploadDate'>) => {
    const newDoc: Document = {
      ...doc,
      id: Date.now().toString(),
      uploadDate: new Date()
    };
    setDocuments(prev => [...prev, newDoc]);
    setSelectedDocuments(prev => [...prev, newDoc.id]);
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    setSelectedDocuments(prev => prev.filter(docId => docId !== id));
  };

  const toggleDocumentSelection = (id: string) => {
    setSelectedDocuments(prev => 
      prev.includes(id) 
        ? prev.filter(docId => docId !== id)
        : [...prev, id]
    );
  };

  const selectAllDocuments = () => {
    setSelectedDocuments(documents.map(doc => doc.id));
  };

  const deselectAllDocuments = () => {
    setSelectedDocuments([]);
  };

  const addNASConnection = (nas: Omit<NASConnection, 'id' | 'isConnected'>) => {
    const newNAS: NASConnection = {
      ...nas,
      id: Date.now().toString(),
      isConnected: false
    };
    setNASConnections(prev => [...prev, newNAS]);
  };

  const connectToNAS = async (id: string): Promise<boolean> => {
    setIsSearching(true);
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setNASConnections(prev => 
      prev.map(nas => ({
        ...nas,
        isConnected: nas.id === id ? true : false
      }))
    );
    
    setCurrentNAS(id);
    setIsSearching(false);
    return true;
  };

  const disconnectFromNAS = (id: string) => {
    setNASConnections(prev => 
      prev.map(nas => ({
        ...nas,
        isConnected: nas.id === id ? false : nas.isConnected
      }))
    );
    
    if (currentNAS === id) {
      setCurrentNAS(null);
      setSearchResults([]);
    }
  };

  const searchNASDocuments = async (keyword: string, nasId?: string) => {
    if (!keyword.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock search results
    const mockResults: SearchResult[] = [
      {
        id: '1',
        name: `${keyword}_specification.pdf`,
        type: 'pdf',
        size: '2.4 MB',
        nasPath: `/documents/specs/${keyword}_specification.pdf`
      },
      {
        id: '2',
        name: `${keyword}_manual.docx`,
        type: 'manual',
        size: '1.8 MB',
        nasPath: `/documents/manuals/${keyword}_manual.docx`
      },
      {
        id: '3',
        name: `${keyword}_config.txt`,
        type: 'text',
        size: '156 KB',
        nasPath: `/config/${keyword}_config.txt`
      }
    ].filter(result => 
      result.name.toLowerCase().includes(keyword.toLowerCase())
    );
    
    setSearchResults(mockResults);
    setIsSearching(false);
  };

  const clearSearchResults = () => {
    setSearchResults([]);
  };

  const value: DocumentContextType = {
    documents,
    selectedDocuments,
    nasConnections,
    currentNAS,
    searchResults,
    isSearching,
    addDocument,
    removeDocument,
    toggleDocumentSelection,
    selectAllDocuments,
    deselectAllDocuments,
    addNASConnection,
    connectToNAS,
    disconnectFromNAS,
    searchNASDocuments,
    clearSearchResults
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = (): DocumentContextType => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};