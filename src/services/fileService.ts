import { FileNode } from '@/types/editor';

// File handle store for saving files back
const fileHandleMap = new Map<string, FileSystemFileHandle>();
let directoryHandle: FileSystemDirectoryHandle | null = null;

function getLanguageFromFileName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    html: 'html',
    htm: 'html',
    css: 'css',
    md: 'markdown',
    py: 'python',
    rs: 'rust',
    go: 'go',
    yaml: 'yaml',
    yml: 'yaml',
    txt: 'plaintext',
  };
  return langMap[ext || ''] || 'plaintext';
}

function generateId(): string {
  return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function openLocalFile(): Promise<FileNode | null> {
  try {
    const [fileHandle] = await window.showOpenFilePicker({
      multiple: false,
    });
    
    const file = await fileHandle.getFile();
    const content = await file.text();
    const id = generateId();
    
    fileHandleMap.set(id, fileHandle);
    
    return {
      id,
      name: file.name,
      type: 'file',
      content,
      language: getLanguageFromFileName(file.name),
    };
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Error opening file:', error);
    }
    return null;
  }
}

async function readDirectoryRecursive(
  dirHandle: FileSystemDirectoryHandle,
  path: string = ''
): Promise<FileNode[]> {
  const nodes: FileNode[] = [];
  
  for await (const [name, handle] of dirHandle.entries()) {
    const id = generateId();
    
    if (handle.kind === 'directory') {
      const children = await readDirectoryRecursive(
        handle as FileSystemDirectoryHandle,
        `${path}/${name}`
      );
      nodes.push({
        id,
        name,
        type: 'folder',
        children,
        isOpen: false,
      });
    } else {
      const fileHandle = handle as FileSystemFileHandle;
      const file = await fileHandle.getFile();
      const content = await file.text();
      
      fileHandleMap.set(id, fileHandle);
      
      nodes.push({
        id,
        name,
        type: 'file',
        content,
        language: getLanguageFromFileName(name),
      });
    }
  }
  
  // Sort: folders first, then files, alphabetically
  return nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export async function openLocalFolder(): Promise<FileNode[] | null> {
  try {
    directoryHandle = await window.showDirectoryPicker();
    const nodes = await readDirectoryRecursive(directoryHandle);
    return nodes;
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Error opening folder:', error);
    }
    return null;
  }
}

export async function saveFile(id: string, content: string): Promise<boolean> {
  const handle = fileHandleMap.get(id);
  
  if (handle) {
    try {
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      return true;
    } catch (error) {
      console.error('Error saving file:', error);
      return false;
    }
  }
  
  return false;
}

export async function saveFileAs(fileName: string, content: string): Promise<FileNode | null> {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: fileName,
      types: [
        {
          description: 'All Files',
          accept: { '*/*': [] },
        },
      ],
    });
    
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    
    const id = generateId();
    fileHandleMap.set(id, handle);
    
    return {
      id,
      name: handle.name,
      type: 'file',
      content,
      language: getLanguageFromFileName(handle.name),
    };
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Error saving file:', error);
    }
    return null;
  }
}

export async function createNewFile(): Promise<FileNode> {
  const id = generateId();
  return {
    id,
    name: 'untitled',
    type: 'file',
    content: '',
    language: 'plaintext',
  };
}

export function getDirectoryHandle(): FileSystemDirectoryHandle | null {
  return directoryHandle;
}

export function hasFileHandle(id: string): boolean {
  return fileHandleMap.has(id);
}

// Check if File System Access API is supported
export function isFileSystemAccessSupported(): boolean {
  return 'showOpenFilePicker' in window;
}
