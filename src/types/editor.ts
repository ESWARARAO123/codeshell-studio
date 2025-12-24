export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  language?: string;
  isOpen?: boolean;
}

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
  timestamp: Date;
}

export type ActivityView = 'explorer' | 'search' | 'git' | 'run' | 'extensions';

export type BottomPanelTab = 'terminal' | 'output' | 'problems';
