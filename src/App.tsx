import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import DocumentManager from './components/DocumentManager';
import ConversationHistory from './components/ConversationHistory';
import SettingsPanel from './components/SettingsPanel';
import { ThemeProvider } from './context/ThemeContext';
import { DocumentProvider } from './context/DocumentContext';
import { ChatProvider } from './context/ChatContext';
import { SettingsProvider } from './context/SettingsContext';

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <DocumentProvider>
          <ChatProvider>
            <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
              <ConversationHistory />
              <main className="flex-1 flex flex-col overflow-hidden">
                <DocumentManager />
                <ChatInterface />
              </main>
              <SettingsPanel />
            </div>
          </ChatProvider>
        </DocumentProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;