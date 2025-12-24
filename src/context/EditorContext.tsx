import React, { createContext, useContext, useState, useCallback } from 'react';
import { FileNode, EditorTab, ActivityView, BottomPanelTab, TerminalLine } from '@/types/editor';
import { mockFileTree, mockTerminalHistory } from '@/data/mockData';

interface EditorContextType {
  // File tree
  fileTree: FileNode[];
  toggleFolder: (folderId: string) => void;
  
  // Tabs
  openTabs: EditorTab[];
  activeTabId: string | null;
  openFile: (file: FileNode) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  
  // Activity bar
  activeView: ActivityView;
  setActiveView: (view: ActivityView) => void;
  
  // Bottom panel
  bottomPanelTab: BottomPanelTab;
  setBottomPanelTab: (tab: BottomPanelTab) => void;
  isBottomPanelOpen: boolean;
  toggleBottomPanel: () => void;
  
  // Terminal
  terminalHistory: TerminalLine[];
  addTerminalLine: (line: Omit<TerminalLine, 'id' | 'timestamp'>) => void;
  
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // Selected file for highlighting
  selectedFileId: string | null;
}

const EditorContext = createContext<EditorContextType | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [fileTree, setFileTree] = useState<FileNode[]>(mockFileTree);
  const [openTabs, setOpenTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActivityView>('explorer');
  const [bottomPanelTab, setBottomPanelTab] = useState<BottomPanelTab>('terminal');
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>(mockTerminalHistory);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const toggleFolder = useCallback((folderId: string) => {
    const toggleInTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === folderId && node.type === 'folder') {
          return { ...node, isOpen: !node.isOpen };
        }
        if (node.children) {
          return { ...node, children: toggleInTree(node.children) };
        }
        return node;
      });
    };
    setFileTree(prev => toggleInTree(prev));
  }, []);

  const openFile = useCallback((file: FileNode) => {
    if (file.type !== 'file') return;
    
    setSelectedFileId(file.id);
    
    const existingTab = openTabs.find(tab => tab.id === file.id);
    if (existingTab) {
      setActiveTabId(file.id);
      return;
    }

    const newTab: EditorTab = {
      id: file.id,
      fileName: file.name,
      filePath: file.name,
      content: file.content || '',
      language: file.language || 'plaintext',
      isModified: false,
    };

    setOpenTabs(prev => [...prev, newTab]);
    setActiveTabId(file.id);
  }, [openTabs]);

  const closeTab = useCallback((tabId: string) => {
    setOpenTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      if (activeTabId === tabId && newTabs.length > 0) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      } else if (newTabs.length === 0) {
        setActiveTabId(null);
        setSelectedFileId(null);
      }
      return newTabs;
    });
  }, [activeTabId]);

  const setActiveTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
    setSelectedFileId(tabId);
  }, []);

  const toggleBottomPanel = useCallback(() => {
    setIsBottomPanelOpen(prev => !prev);
  }, []);

  const addTerminalLine = useCallback((line: Omit<TerminalLine, 'id' | 'timestamp'>) => {
    const newLine: TerminalLine = {
      ...line,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setTerminalHistory(prev => [...prev, newLine]);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  return (
    <EditorContext.Provider
      value={{
        fileTree,
        toggleFolder,
        openTabs,
        activeTabId,
        openFile,
        closeTab,
        setActiveTab,
        activeView,
        setActiveView,
        bottomPanelTab,
        setBottomPanelTab,
        isBottomPanelOpen,
        toggleBottomPanel,
        terminalHistory,
        addTerminalLine,
        isSidebarOpen,
        toggleSidebar,
        selectedFileId,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
}
