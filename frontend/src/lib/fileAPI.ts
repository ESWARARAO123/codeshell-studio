const API_BASE = 'http://localhost:3001/api';

export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modified: Date;
}

export const fileAPI = {
  async getFiles(dirPath?: string): Promise<FileItem[]> {
    const url = new URL(`${API_BASE}/files`);
    if (dirPath) url.searchParams.set('path', dirPath);
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch files');
    return response.json();
  },

  async readFile(filePath: string): Promise<string> {
    const url = new URL(`${API_BASE}/file`);
    url.searchParams.set('path', filePath);
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to read file');
    const data = await response.json();
    return data.content;
  },

  async saveFile(filePath: string, content: string): Promise<void> {
    const response = await fetch(`${API_BASE}/file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, content })
    });
    if (!response.ok) throw new Error('Failed to save file');
  },

  async createFile(filePath: string, content = ''): Promise<void> {
    const response = await fetch(`${API_BASE}/file/new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, content })
    });
    if (!response.ok) throw new Error('Failed to create file');
  },

  async createFolder(folderPath: string): Promise<void> {
    const response = await fetch(`${API_BASE}/folder/new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: folderPath })
    });
    if (!response.ok) throw new Error('Failed to create folder');
  },

  async deleteItem(itemPath: string): Promise<void> {
    const response = await fetch(`${API_BASE}/file`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: itemPath })
    });
    if (!response.ok) throw new Error('Failed to delete item');
  },

  async renameItem(oldPath: string, newPath: string): Promise<void> {
    const response = await fetch(`${API_BASE}/file/rename`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPath, newPath })
    });
    if (!response.ok) throw new Error('Failed to rename item');
  }
};