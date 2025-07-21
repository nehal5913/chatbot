import React, { useState, useRef } from 'react';
import { Upload, File, Globe, BookOpen, FileText, X, Check, Eye, EyeOff, ChevronDown, ChevronUp, Search, Server, Wifi, WifiOff, Plus, FolderOpen } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { useSettings } from '../context/SettingsContext';

const DocumentManager: React.FC = () => {
  const { 
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
  } = useDocuments();
  const { fontSize } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showNASPanel, setShowNASPanel] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAddNAS, setShowAddNAS] = useState(false);
  const [newNAS, setNewNAS] = useState({ name: '', host: '', username: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fontSizeClass = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }[fontSize];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <File className="w-4 h-4 text-red-500" />;
      case 'webpage':
        return <Globe className="w-4 h-4 text-primary-500" />;
      case 'manual':
        return <BookOpen className="w-4 h-4 text-secondary-500" />;
      default:
        return <FileText className="w-4 h-4 text-neutral-500" />;
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      const fileType = file.type === 'application/pdf' ? 'pdf' : 'text';
      addDocument({
        name: file.name,
        type: fileType,
        size: formatFileSize(file.size)
      });
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const allSelected = documents.length > 0 && selectedDocuments.length === documents.length;
  const someSelected = selectedDocuments.length > 0 && selectedDocuments.length < documents.length;

  const handleNASSearch = async () => {
    if (searchKeyword.trim() && currentNAS) {
      await searchNASDocuments(searchKeyword, currentNAS);
    }
  };

  const handleAddNAS = () => {
    if (newNAS.name && newNAS.host && newNAS.username) {
      addNASConnection(newNAS);
      setNewNAS({ name: '', host: '', username: '' });
      setShowAddNAS(false);
    }
  };

  const addSearchResultToDocuments = (doc: any) => {
    addDocument(doc);
    clearSearchResults();
  };

  const currentNASConnection = nasConnections.find(nas => nas.id === currentNAS);

  return (
    <div className="bg-gradient-to-r from-white to-slate-50 dark:from-neutral-800 dark:to-neutral-800/95 border-b border-neutral-200 dark:border-neutral-700 transition-all duration-300 shadow-sm">
      {/* Compact Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <h2 className={`font-semibold text-neutral-900 dark:text-white ${fontSizeClass}`}>
              Documents
            </h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gradient-to-r from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-900/20 text-primary-700 dark:text-primary-300 font-medium">
              {selectedDocuments.length} of {documents.length} selected
            </span>
          </div>
          
          {documents.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={allSelected ? deselectAllDocuments : selectAllDocuments}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  allSelected || someSelected
                    ? 'bg-gradient-to-r from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 hover:shadow-sm'
                }`}
              >
                {allSelected ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNASPanel(!showNASPanel)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              currentNAS 
                ? 'bg-gradient-to-r from-secondary-100 to-secondary-50 dark:from-secondary-900/30 dark:to-secondary-900/20 text-secondary-700 dark:text-secondary-300 shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
            }`}
          >
            <Server className="w-4 h-4" />
            <span className={fontSizeClass}>NAS</span>
            {currentNAS && <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse" />}
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Upload className="w-4 h-4" />
            <span className={fontSizeClass}>Upload</span>
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-all duration-200"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* NAS Panel */}
      {showNASPanel && (
        <div className="px-6 pb-4 border-t border-neutral-100 dark:border-neutral-700 bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-700/50 dark:to-neutral-800">
          <div className="mt-4 space-y-4">
            {/* NAS Connections */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-medium text-neutral-900 dark:text-white ${fontSizeClass}`}>
                  NAS Connections
                </h4>
                <button
                  onClick={() => setShowAddNAS(!showAddNAS)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/40 transition-colors text-sm"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add NAS</span>
                </button>
              </div>
              
              {showAddNAS && (
                <div className="mb-4 p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-600 space-y-3">
                  <input
                    type="text"
                    placeholder="NAS Name"
                    value={newNAS.name}
                    onChange={(e) => setNewNAS(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Host (e.g., 192.168.1.100)"
                    value={newNAS.host}
                    onChange={(e) => setNewNAS(prev => ({ ...prev, host: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Username"
                    value={newNAS.username}
                    onChange={(e) => setNewNAS(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddNAS}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddNAS(false)}
                      className="px-4 py-2 bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-500 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                {nasConnections.map((nas) => (
                  <div
                    key={nas.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                      nas.isConnected
                        ? 'bg-gradient-to-r from-secondary-50 to-secondary-25 dark:from-secondary-900/20 dark:to-secondary-900/10 border-secondary-200 dark:border-secondary-800'
                        : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {nas.isConnected ? (
                        <Wifi className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-neutral-400" />
                      )}
                      <div>
                        <h5 className={`font-medium text-neutral-900 dark:text-white ${fontSizeClass}`}>
                          {nas.name}
                        </h5>
                        <p className={`text-neutral-500 dark:text-neutral-400 ${
                          fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-sm' : 'text-xs'
                        }`}>
                          {nas.host} • {nas.username}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => nas.isConnected ? disconnectFromNAS(nas.id) : connectToNAS(nas.id)}
                      disabled={isSearching}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        nas.isConnected
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40'
                          : 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-900/40'
                      }`}
                    >
                      {nas.isConnected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Document Search */}
            {currentNASConnection && (
              <div>
                <h4 className={`font-medium text-neutral-900 dark:text-white mb-3 ${fontSizeClass}`}>
                  Search Documents
                </h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search for documents..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleNASSearch()}
                  />
                  <button
                    onClick={handleNASSearch}
                    disabled={isSearching || !searchKeyword.trim()}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <h5 className={`font-medium text-neutral-900 dark:text-white ${fontSizeClass}`}>
                        Search Results
                      </h5>
                      <button
                        onClick={clearSearchResults}
                        className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                      >
                        Clear
                      </button>
                    </div>
                    {searchResults.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-600"
                      >
                        <div className="flex items-center space-x-3">
                          <FolderOpen className="w-4 h-4 text-neutral-400" />
                          <div>
                            <h6 className={`font-medium text-neutral-900 dark:text-white ${fontSizeClass}`}>
                              {doc.name}
                            </h6>
                            <p className={`text-neutral-500 dark:text-neutral-400 ${
                              fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-sm' : 'text-xs'
                            }`}>
                              {doc.path}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => addSearchResultToDocuments(doc)}
                          className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/40 transition-colors text-sm"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expanded Document List */}
      {isExpanded && (
        <div className="px-6 pb-4 border-t border-neutral-100 dark:border-neutral-700">
          {documents.length === 0 ? (
            <div
              className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className={`font-medium text-neutral-900 dark:text-white mb-2 ${fontSizeClass}`}>
                Upload your technical documents
              </h3>
              <p className={`text-neutral-500 dark:text-neutral-400 mb-4 ${
                fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-base' : 'text-sm'
              }`}>
                Drag and drop files here, or click to browse
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Choose Files
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                    selectedDocuments.includes(doc.id)
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                      : 'bg-neutral-50 dark:bg-neutral-700/50 border-neutral-200 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(doc.id)}
                      onChange={() => toggleDocumentSelection(doc.id)}
                      className="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    {getFileIcon(doc.type)}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-neutral-900 dark:text-white truncate ${fontSizeClass}`}>
                        {doc.name}
                      </h4>
                      <p className={`text-neutral-500 dark:text-neutral-400 ${
                        fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-sm' : 'text-xs'
                      }`}>
                        {doc.size} • {doc.uploadDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                    title="Remove document"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.doc,.docx"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
};

export default DocumentManager;