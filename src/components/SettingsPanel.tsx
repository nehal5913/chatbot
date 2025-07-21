import React from 'react';
import { Settings, Moon, Sun, Type, X, Palette, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';

const SettingsPanel: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { fontSize, setFontSize, isSettingsOpen, setIsSettingsOpen } = useSettings();

  if (!isSettingsOpen) {
    return (
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed top-4 right-4 p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 z-50 hover:scale-105"
        title="Settings"
      >
        <Settings className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 w-80 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </h3>
        <button
          onClick={() => setIsSettingsOpen(false)}
          className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Content */}
      <div className="p-4 space-y-6">
        {/* Theme Settings */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>Appearance</span>
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-700 dark:text-neutral-300">Dark Mode</span>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDarkMode ? 'bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                <span className="absolute left-1 top-1">
                  {isDarkMode ? (
                    <Moon className="w-3 h-3 text-primary-600" />
                  ) : (
                    <Sun className="w-3 h-3 text-neutral-400" />
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Font Size Settings */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center space-x-2">
            <Type className="w-4 h-4" />
            <span>Text Size</span>
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  fontSize === size
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                }`}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
          <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
            <p className={`text-neutral-700 dark:text-neutral-300 ${
              fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base'
            }`}>
              Sample text at {fontSize} size
            </p>
          </div>
        </div>

        {/* Accessibility */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
            Accessibility
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-700 dark:text-neutral-300">Reduce Motion</span>
              <button
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 dark:bg-neutral-700 transition-colors"
                onClick={() => {
                  // This would toggle motion preferences
                  document.documentElement.style.setProperty('--animation-duration', '0s');
                }}
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-700 dark:text-neutral-300">High Contrast</span>
              <button
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 dark:bg-neutral-700 transition-colors"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Voice Settings */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center space-x-2">
            <Volume2 className="w-4 h-4" />
            <span>Voice</span>
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-700 dark:text-neutral-300">Voice Input</span>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-700 dark:text-neutral-300">Voice Feedback</span>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 dark:bg-neutral-700 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Reset Settings */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => {
              setFontSize('medium');
              // Reset other settings to defaults
            }}
            className="w-full py-2 px-4 bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:from-neutral-200 hover:to-neutral-300 dark:hover:from-neutral-600 dark:hover:to-neutral-500 transition-all duration-200 text-sm font-medium"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;