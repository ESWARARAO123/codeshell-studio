import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '@/context/EditorContext';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CodeEditor() {
  const { openTabs, activeTabId, updateTabContent } = useEditor();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  
  const activeTab = openTabs.find(tab => tab.id === activeTabId);

  useEffect(() => {
    if (textareaRef.current && activeTab) {
      textareaRef.current.focus();
    }
  }, [activeTabId]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeTabId) {
      updateTabContent(activeTabId, e.target.value);
    }
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const text = textarea.value.substring(0, textarea.selectionStart);
    const lines = text.split('\n');
    setCursorPosition({
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      
      if (activeTabId) {
        updateTabContent(activeTabId, newValue);
        // Set cursor position after tab
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    }
  };

  if (!activeTab) {
    return (
      <div className="flex-1 flex items-center justify-center bg-vscode-editor text-muted-foreground">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-20">VS</div>
          <p className="text-lg">Visual Studio Code</p>
          <p className="text-sm mt-2">Open a file from the explorer to start editing</p>
          <p className="text-xs mt-4 text-muted-foreground/60">
            Use File → Open File or Open Folder to load local files
          </p>
        </div>
      </div>
    );
  }

  const lines = activeTab.content.split('\n');
  const lineCount = lines.length;

  return (
    <div className="flex-1 flex bg-vscode-editor relative">
      {/* Line numbers */}
      <div className="flex-shrink-0 bg-vscode-editor select-none pt-0 overflow-hidden">
        <div className="flex flex-col">
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              className="h-[22px] w-12 text-right pr-4 text-[hsl(var(--vscode-line-number))] text-sm font-mono leading-[22px]"
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
      
      {/* Editor textarea */}
      <ScrollArea className="flex-1 vscode-scrollbar">
        <textarea
          ref={textareaRef}
          value={activeTab.content}
          onChange={handleContentChange}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="w-full min-h-full bg-transparent text-foreground font-mono text-sm leading-[22px] resize-none outline-none p-0 border-none"
          style={{
            minHeight: `${lineCount * 22}px`,
            tabSize: 2,
          }}
        />
      </ScrollArea>
      
      {/* Cursor position indicator */}
      <div className="absolute bottom-2 right-4 text-xs text-muted-foreground">
        Ln {cursorPosition.line}, Col {cursorPosition.column}
      </div>
    </div>
  );
}
