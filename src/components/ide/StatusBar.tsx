import React from 'react';
import { GitBranch, AlertCircle, AlertTriangle, Bell, CheckCircle2, HardDrive, CloudOff } from 'lucide-react';
import { useEditor } from '@/context/EditorContext';
import { mockProblems } from '@/data/mockData';

export function StatusBar() {
  const { openTabs, activeTabId, toggleBottomPanel, isFileSystemSupported } = useEditor();
  const activeTab = openTabs.find(tab => tab.id === activeTabId);

  const errors = mockProblems.filter(p => p.type === 'error').length;
  const warnings = mockProblems.filter(p => p.type === 'warning').length;

  const getLanguageDisplay = (language?: string) => {
    switch (language) {
      case 'typescript':
        return 'TypeScript React';
      case 'javascript':
        return 'JavaScript';
      case 'json':
        return 'JSON';
      case 'html':
        return 'HTML';
      case 'css':
        return 'CSS';
      case 'markdown':
        return 'Markdown';
      case 'python':
        return 'Python';
      default:
        return 'Plain Text';
    }
  };

  return (
    <div className="h-6 bg-vscode-statusbar flex items-center justify-between text-primary-foreground text-xs">
      <div className="flex items-center">
        <div className="status-bar-item">
          <GitBranch size={12} />
          <span>main</span>
        </div>
        <button 
          onClick={toggleBottomPanel}
          className="status-bar-item"
        >
          <AlertCircle size={12} />
          <span>{errors}</span>
          <AlertTriangle size={12} className="ml-1" />
          <span>{warnings}</span>
        </button>
      </div>
      <div className="flex items-center">
        {isFileSystemSupported ? (
          <div className="status-bar-item text-green-400">
            <HardDrive size={12} />
            <span>Local FS</span>
          </div>
        ) : (
          <div className="status-bar-item text-yellow-400">
            <CloudOff size={12} />
            <span>No FS Access</span>
          </div>
        )}
        {activeTab && (
          <>
            <div className="status-bar-item">
              Spaces: 2
            </div>
            <div className="status-bar-item">
              UTF-8
            </div>
            <div className="status-bar-item">
              {getLanguageDisplay(activeTab.language)}
            </div>
          </>
        )}
        <div className="status-bar-item">
          <CheckCircle2 size={12} />
          <span>Prettier</span>
        </div>
        <div className="status-bar-item">
          <Bell size={12} />
        </div>
      </div>
    </div>
  );
}
