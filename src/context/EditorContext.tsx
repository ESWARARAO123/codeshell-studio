import React, { createContext, useContext, useState, useCallback } from 'react';
import { FileNode, EditorTab, ActivityView, BottomPanelTab, TerminalLine } from '@/types/editor';
import { mockFileTree, mockTerminalHistory } from '@/data/mockData';
import {
  openLocalFile,
  openLocalFolder,
  saveFile,
  saveFileAs,
  createNewFile,
  hasFileHandle,
  isFileSystemAccessSupported,
} from '@/services/fileService';

interface EditorContextType {
  // File tree
  fileTree: FileNode[];
  toggleFolder: (folderId: string) => void;
  setFileTree: (tree: FileNode[]) => void;
  
  // Tabs
  openTabs: EditorTab[];
  activeTabId: string | null;
  openFile: (file: FileNode) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  
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
  
  // File operations
  handleOpenFile: () => Promise<void>;
  handleOpenFolder: () => Promise<void>;
  handleSave: () => Promise<void>;
  handleSaveAs: () => Promise<void>;
  handleNewFile: () => Promise<void>;
  isFileSystemSupported: boolean;
  projectName: string;
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
  const [projectName, setProjectName] = useState('my-vscode-project');

  const isFileSystemSupported = isFileSystemAccessSupported();

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

  const updateTabContent = useCallback((tabId: string, content: string) => {
    setOpenTabs(prev =>
      prev.map(tab =>
        tab.id === tabId ? { ...tab, content, isModified: true } : tab
      )
    );
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

  // File operations
  const handleOpenFile = useCallback(async () => {
    const file = await openLocalFile();
    if (file) {
      // Add to file tree
      setFileTree(prev => {
        const exists = prev.some(f => f.id === file.id);
        if (!exists) {
          return [...prev, file];
        }
        return prev;
      });
      openFile(file);
    }
  }, [openFile]);

  const handleOpenFolder = useCallback(async () => {
    const nodes = await openLocalFolder();
    if (nodes) {
      setFileTree(nodes);
      setProjectName('Local Folder');
      setOpenTabs([]);
      setActiveTabId(null);
      setSelectedFileId(null);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!activeTabId) return;
    
    const tab = openTabs.find(t => t.id === activeTabId);
    if (!tab) return;

    if (hasFileHandle(activeTabId)) {
      const success = await saveFile(activeTabId, tab.content);
      if (success) {
        setOpenTabs(prev =>
          prev.map(t => (t.id === activeTabId ? { ...t, isModified: false } : t))
        );
      }
    } else {
      // No file handle, do Save As
      await handleSaveAs();
    }
  }, [activeTabId, openTabs]);

  const handleSaveAs = useCallback(async () => {
    if (!activeTabId) return;
    
    const tab = openTabs.find(t => t.id === activeTabId);
    if (!tab) return;

    const newFile = await saveFileAs(tab.fileName, tab.content);
    if (newFile) {
      // Update the tab with new file info
      setOpenTabs(prev =>
        prev.map(t =>
          t.id === activeTabId
            ? { ...t, id: newFile.id, fileName: newFile.name, isModified: false }
            : t
        )
      );
      setActiveTabId(newFile.id);
      setSelectedFileId(newFile.id);
    }
  }, [activeTabId, openTabs]);

  const handleNewFile = useCallback(async () => {
    const file = await createNewFile();
    openFile(file);
  }, [openFile]);

  return (
    <EditorContext.Provider
      value={{
        fileTree,
        toggleFolder,
        setFileTree,
        openTabs,
        activeTabId,
        openFile,
        closeTab,
        setActiveTab,
        updateTabContent,
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
        handleOpenFile,
        handleOpenFolder,
        handleSave,
        handleSaveAs,
        handleNewFile,
        isFileSystemSupported,
        projectName,
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
