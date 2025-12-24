import React from 'react';
import { GitBranch, AlertCircle, AlertTriangle, Bell, CheckCircle2 } from 'lucide-react';
import { useEditor } from '@/context/EditorContext';

export function StatusBar() {
  const { openTabs, activeTabId, toggleBottomPanel, isBottomPanelOpen } = useEditor();
  const activeTab = openTabs.find(tab => tab.id === activeTabId);

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
      default:
        return 'Plain Text';
    }
  };

  return (
    <div className="h-6 bg-pinnacle-statusbar flex items-center justify-between text-primary-foreground text-xs">
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
          <span>0</span>
          <AlertTriangle size={12} className="ml-1" />
          <span>0</span>
        </button>
      </div>
      <div className="flex items-center">
        {activeTab && (
          <>
            <div className="status-bar-item">
              Ln 1, Col 1
            </div>
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
