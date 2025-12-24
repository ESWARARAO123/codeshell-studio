import React from 'react';
import { X, File } from 'lucide-react';
import { useEditor } from '@/context/EditorContext';
import { cn } from '@/lib/utils';

function getFileIcon(fileName: string): { color: string } {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return { color: 'text-blue-400' };
    case 'js':
    case 'jsx':
      return { color: 'text-yellow-400' };
    case 'json':
      return { color: 'text-yellow-300' };
    case 'html':
      return { color: 'text-orange-400' };
    case 'css':
    case 'scss':
      return { color: 'text-purple-400' };
    case 'md':
      return { color: 'text-blue-300' };
    default:
      return { color: 'text-muted-foreground' };
  }
}

export function EditorTabs() {
  const { openTabs, activeTabId, setActiveTab, closeTab } = useEditor();

  if (openTabs.length === 0) return null;

  return (
    <div className="flex bg-vscode-sidebar border-b border-border overflow-x-auto">
      {openTabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const fileStyle = getFileIcon(tab.fileName);

        return (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn('editor-tab group', isActive && 'active')}
          >
            <File size={14} className={cn('flex-shrink-0', fileStyle.color)} />
            <span className="truncate max-w-[120px]">{tab.fileName}</span>
            {tab.isModified && (
              <span className="w-2 h-2 bg-foreground rounded-full flex-shrink-0" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-vscode-hover transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
