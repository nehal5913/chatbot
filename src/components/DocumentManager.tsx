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
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isNASExpanded, setIsNASExpanded] = useState(false);

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
    if (!searchKeyword.trim()) return;
    setShowSearchResults(true);
    await searchNASDocuments(searchKeyword, currentNAS || undefined);
  };

  const handleAddNAS = () => {
    if (newNAS.name && newNAS.host && newNAS.username) {
      addNASConnection(newNAS);
      setNewNAS({ name: '', host: '', username: '' });
      setShowAddNAS(false);
    }
  };

  const handleConnectNAS = async (nasId: string) => {
    const success = await connectToNAS(nasId);
    if (success) {
      setShowNASPanel(true);
    }
  };

  const addSearchResultToDocuments = (doc: any) => {
    addDocument({
      name: doc.name,
      type: doc.type,
      size: doc.size,
      source: 'nas',
      nasPath: doc.nasPath
    });
    setShowSearchResults(false);
    clearSearchResults();
  };

  return (
    <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 transition-colors duration-300">
      {/* Compact Header */}
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <h2 className={`font-semibold text-slate-900 dark:text-white ${fontSizeClass}`}>
              Documents
            </h2>
            {documents.length > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                {selectedDocuments.length} of {documents.length} selected
              </span>
            )}
          </div>
          
          {documents.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={allSelected ? deselectAllDocuments : selectAllDocuments}
                className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                  allSelected || someSelected
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
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
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Upload className="w-4 h-4" />
            <span className={fontSizeClass}>Upload</span>
          </button>
          
          <button
            onClick={() => setShowNASPanel(!showNASPanel)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              currentNAS 
                ? 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 border border-secondary-200 dark:border-secondary-800' 
                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
            }`}
          >
            <Server className="w-4 h-4" />
            <span className={fontSizeClass}>NAS</span>
            {currentNAS && <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>}
            {showNASPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-all duration-200"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Selected Documents Display */}
      {selectedDocuments.length > 0 && (
        <div className="px-6 py-3 bg-primary-50 dark:bg-primary-900/10 border-b border-primary-100 dark:border-primary-800/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-medium text-primary-900 dark:text-primary-100 ${fontSizeClass}`}>
              Active Documents ({selectedDocuments.length})
            </h3>
            <button
              onClick={deselectAllDocuments}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedDocuments.map((docId) => {
              const doc = documents.find(d => d.id === docId);
              if (!doc) return null;
              return (
                <div
                  key={docId}
                  className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-primary-200 dark:border-primary-700 shadow-sm"
                >
                  {getFileIcon(doc.type)}
                  <span className={`text-slate-900 dark:text-white font-medium ${
                    fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-base' : 'text-sm'
                  }`}>
                    {doc.name.length > 25 ? `${doc.name.slice(0, 25)}...` : doc.name}
                  </span>
                  <button
                    onClick={() => toggleDocumentSelection(docId)}
                    className="p-1 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
                    title="Remove from selection"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
          <p className={`mt-2 text-primary-700 dark:text-primary-300 ${
            fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-sm' : 'text-xs'
          }`}>
            💡 These documents will be used to answer your questions
          </p>
        </div>
      )}

      {/* Expanded Document List */}
      {isExpanded && (
        <div className="px-6 pb-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mt-4 mb-3">
            <h3 className={`font-medium text-slate-900 dark:text-white ${fontSizeClass}`}>
              All Documents
            </h3>
            {documents.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className={`text-slate-500 dark:text-slate-400 ${
                  fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-sm' : 'text-xs'
                }`}>
                  Click to select/deselect
                </span>
              </div>
            )}
          </div>
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
                className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Choose Files
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                    selectedDocuments.includes(doc.id)
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
                  onClick={() => toggleDocumentSelection(doc.id)}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(doc.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleDocumentSelection(doc.id);
                      }}
                      className="w-4 h-4 text-primary-600 bg-slate-100 border-slate-300 rounded focus:ring-primary-500 focus:ring-2"
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
                    onClick={(e) => { e.stopPropagation(); removeDocument(doc.id); }}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
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

      {/* NAS Panel */}
      {showNASPanel && (
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-700 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h3 className={`font-semibold text-neutral-900 dark:text-white ${fontSizeClass}`}>
                NAS Drive Management
              </h3>
              {currentNAS && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400">
                  Connected
                </span>
              )}
            </div>
            <button
              onClick={() => setShowAddNAS(!showAddNAS)}
              className="flex items-center space-x-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add NAS</span>
            </button>
          </div>

          {/* Add NAS Form */}
          {showAddNAS && (
            <div className="mb-4 p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Add New NAS Connection</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="NAS Name"
                  value={newNAS.name}
                  onChange={(e) => setNewNAS(prev => ({ ...prev, name: e.target.value }))}
                  className="px-3 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Host/IP Address"
                  value={newNAS.host}
                  onChange={(e) => setNewNAS(prev => ({ ...prev, host: e.target.value }))}
                  className="px-3 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={newNAS.username}
                  onChange={(e) => setNewNAS(prev => ({ ...prev, username: e.target.value }))}
                  className="px-3 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddNAS}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add Connection
                </button>
                <button
                  onClick={() => setShowAddNAS(false)}
                  className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* NAS Connections */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-neutral-900 dark:text-white">Available Connections</h4>
              <button
                onClick={() => setIsNASExpanded(!isNASExpanded)}
                className="flex items-center space-x-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
              >
                <span>{isNASExpanded ? 'Collapse' : 'Expand'}</span>
                {isNASExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            
            {/* Always show connected NAS */}
            {nasConnections.filter(nas => nas.isConnected).map((nas) => (
              <div
                key={nas.id}
                className="p-4 rounded-lg border bg-secondary-50 dark:bg-secondary-900/20 border-secondary-200 dark:border-secondary-800 mb-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-neutral-900 dark:text-white">{nas.name}</h4>
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-4 h-4 text-secondary-500" />
                    <span className="text-xs text-secondary-600 dark:text-secondary-400 font-medium">Connected</span>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  {nas.host} • {nas.username}
                </p>
                <button
                  onClick={() => disconnectFromNAS(nas.id)}
                  className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ))}
            
            {/* Collapsible section for other connections */}
            {isNASExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nasConnections.filter(nas => !nas.isConnected).map((nas) => (
                  <div
                    key={nas.id}
                    className="p-4 rounded-lg border bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-neutral-900 dark:text-white">{nas.name}</h4>
                      <WifiOff className="w-4 h-4 text-neutral-400" />
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                      {nas.host} • {nas.username}
                    </p>
                    <button
                      onClick={() => handleConnectNAS(nas.id)}
                      disabled={isSearching}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-sm hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors disabled:opacity-50"
                    >
                      {isSearching ? 'Connecting...' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Show expand button if there are disconnected connections */}
            {!isNASExpanded && nasConnections.filter(nas => !nas.isConnected).length > 0 && (
              <div className="text-center">
                <button
                  onClick={() => setIsNASExpanded(true)}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition-colors"
                >
                  Show {nasConnections.filter(nas => !nas.isConnected).length} more connection{nasConnections.filter(nas => !nas.isConnected).length !== 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>
          
          {/* Compact NAS connections for when collapsed */}
          {!isNASExpanded && nasConnections.filter(nas => !nas.isConnected).length === 0 && nasConnections.filter(nas => nas.isConnected).length === 0 && (
            <div className="text-center py-4">
              <Server className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No NAS connections configured</p>
            </div>
          )}

          {/* NAS Search */}
          {currentNAS && (
            <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <h4 className="font-medium text-neutral-900 dark:text-white mb-3 flex items-center space-x-2">
                <FolderOpen className="w-4 h-4" />
                <span>Search NAS Documents</span>
              </h4>
              <div className="flex space-x-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Enter filename or keyword..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleNASSearch()}
                    className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleNASSearch}
                  disabled={!searchKeyword.trim() || isSearching}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Search Results */}
              {showSearchResults && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-neutral-900 dark:text-white">Search Results</h5>
                    <button
                      onClick={() => {
                        setShowSearchResults(false);
                        clearSearchResults();
                      }}
                      className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {searchResults.length === 0 ? (
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm py-4 text-center">
                      {isSearching ? 'Searching NAS drive...' : 'No documents found matching your search.'}
                    </p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {searchResults.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg border border-neutral-200 dark:border-neutral-600"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            {getFileIcon(doc.type)}
                            <div className="flex-1 min-w-0">
                              <h6 className="font-medium text-neutral-900 dark:text-white truncate text-sm">
                                {doc.name}
                              </h6>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                                {doc.nasPath} • {doc.size}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => addSearchResultToDocuments(doc)}
                            className="px-3 py-1 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 rounded text-sm hover:bg-secondary-200 dark:hover:bg-secondary-900/50 transition-colors"
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