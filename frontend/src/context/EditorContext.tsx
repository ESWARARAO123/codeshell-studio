import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fileAPI, FileItem } from '@/lib/fileAPI';

export interface EditorTab {
  id: string;
  fileName: string;
  filePath: string;
  content: string;
  language: string;
  isModified: boolean;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'info';
  content: string;
}

export type ActivityView = 'explorer' | 'search' | 'git' | 'run' | 'extensions' | 'agent';
export type BottomPanelTab = 'terminal' | 'output' | 'problems';

interface EditorContextType {
  // File system
  files: FileItem[];
  currentWorkspace: string | null;
  openWorkspace: (folderPath: string) => Promise<void>;
  loadFiles: (dirPath?: string) => Promise<void>;
  createFile: (filePath: string, content?: string) => Promise<void>;
  createFolder: (folderPath: string) => Promise<void>;
  deleteItem: (itemPath: string) => Promise<void>;
  renameItem: (oldPath: string, newPath: string) => Promise<void>;
  
  // Tabs
  openTabs: EditorTab[];
  activeTabId: string | null;
  openFile: (filePath: string) => Promise<void>;
  setActiveTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  saveFile: (tabId: string) => Promise<void>;
  
  // UI state
  activeView: ActivityView;
  setActiveView: (view: ActivityView) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isBottomPanelOpen: boolean;
  toggleBottomPanel: () => void;
  bottomPanelTab: BottomPanelTab;
  setBottomPanelTab: (tab: BottomPanelTab) => void;
  
  // Terminal
  terminalHistory: TerminalLine[];
  addTerminalLine: (line: Omit<TerminalLine, 'id'>) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<string | null>(null);
  const [openTabs, setOpenTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActivityView>('explorer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(false);
  const [bottomPanelTab, setBottomPanelTab] = useState<BottomPanelTab>('terminal');
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([
    { id: '1', type: 'info', content: 'Welcome to Pinnacle IDE Terminal' }
  ]);

  const loadFiles = useCallback(async (dirPath?: string) => {
    if (!dirPath) {
      setFiles([]);
      return;
    }
    try {
      const fileList = await fileAPI.getFiles(dirPath);
      setFiles(fileList);
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  }, []);

  // Don't load files automatically on mount

  const openFile = useCallback(async (filePath: string) => {
    try {
      const existingTab = openTabs.find(tab => tab.filePath === filePath);
      if (existingTab) {
        setActiveTabId(existingTab.id);
        return;
      }

      const content = await fileAPI.readFile(filePath);
      const fileName = filePath.split(/[\\/]/).pop() || 'untitled';
      const language = getLanguageFromFileName(fileName);
      
      const newTab: EditorTab = {
        id: Date.now().toString(),
        fileName,
        filePath,
        content,
        language,
        isModified: false
      };

      setOpenTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  }, [openTabs]);

  const openWorkspace = useCallback(async (folderPath: string) => {
    setCurrentWorkspace(folderPath);
    await loadFiles(folderPath);
  }, [loadFiles]);

  const createFile = useCallback(async (filePath: string, content = '') => {
    try {
      await fileAPI.createFile(filePath, content);
      if (currentWorkspace) {
        await loadFiles(currentWorkspace);
      }
    } catch (error) {
      console.error('Failed to create file:', error);
    }
  }, [loadFiles, currentWorkspace]);

  const createFolder = useCallback(async (folderPath: string) => {
    try {
      await fileAPI.createFolder(folderPath);
      if (currentWorkspace) {
        await loadFiles(currentWorkspace);
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  }, [loadFiles, currentWorkspace]);

  const deleteItem = useCallback(async (itemPath: string) => {
    try {
      await fileAPI.deleteItem(itemPath);
      if (currentWorkspace) {
        await loadFiles(currentWorkspace);
      }
      
      // Close tabs for deleted files
      setOpenTabs(prev => prev.filter(tab => !tab.filePath.startsWith(itemPath)));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  }, [loadFiles, currentWorkspace]);

  const renameItem = useCallback(async (oldPath: string, newPath: string) => {
    try {
      await fileAPI.renameItem(oldPath, newPath);
      if (currentWorkspace) {
        await loadFiles(currentWorkspace);
      }
    } catch (error) {
      console.error('Failed to rename item:', error);
    }
  }, [loadFiles, currentWorkspace]);

  const updateTabContent = useCallback((tabId: string, content: string) => {
    setOpenTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, content, isModified: true }
        : tab
    ));
  }, []);

  const saveFile = useCallback(async (tabId: string) => {
    const tab = openTabs.find(t => t.id === tabId);
    if (!tab) return;

    try {
      await fileAPI.saveFile(tab.filePath, tab.content);
      setOpenTabs(prev => prev.map(t => 
        t.id === tabId ? { ...t, isModified: false } : t
      ));
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  }, [openTabs]);

  const closeTab = useCallback((tabId: string) => {
    setOpenTabs(prev => prev.filter(tab => tab.id !== tabId));
    if (activeTabId === tabId) {
      const remainingTabs = openTabs.filter(tab => tab.id !== tabId);
      setActiveTabId(remainingTabs.length > 0 ? remainingTabs[0].id : null);
    }
  }, [activeTabId, openTabs]);

  const addTerminalLine = useCallback((line: Omit<TerminalLine, 'id'>) => {
    setTerminalHistory(prev => [...prev, { ...line, id: Date.now().toString() }]);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const toggleBottomPanel = useCallback(() => {
    setIsBottomPanelOpen(prev => !prev);
  }, []);

  const setActiveTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  return (
    <EditorContext.Provider value={{
      files,
      currentWorkspace,
      openWorkspace,
      loadFiles,
      createFile,
      createFolder,
      deleteItem,
      renameItem,
      openTabs,
      activeTabId,
      openFile,
      setActiveTab,
      closeTab,
      updateTabContent,
      saveFile,
      activeView,
      setActiveView,
      isSidebarOpen,
      toggleSidebar,
      isBottomPanelOpen,
      toggleBottomPanel,
      bottomPanelTab,
      setBottomPanelTab,
      terminalHistory,
      addTerminalLine
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}

function getLanguageFromFileName(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts': case 'tsx': return 'typescript';
    case 'js': case 'jsx': return 'javascript';
    case 'json': return 'json';
    case 'html': return 'html';
    case 'css': case 'scss': return 'css';
    case 'md': return 'markdown';
    case 'py': return 'python';
    default: return 'text';
  }
}