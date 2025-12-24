import React, { useState, useEffect } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { fileAPI, FileItem } from '@/lib/fileAPI';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FolderBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFolder: (folderPath: string) => void;
}

interface FolderItemProps {
  folder: FileItem;
  level: number;
  onSelect: (path: string) => void;
}

function FolderItem({ folder, level, onSelect }: FolderItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [children, setChildren] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (!isExpanded && children.length === 0) {
      setIsLoading(true);
      try {
        const childFolders = await fileAPI.getFiles(folder.path);
        setChildren(childFolders.filter(item => item.isDirectory));
      } catch (error) {
        console.error('Failed to load folders:', error);
      }
      setIsLoading(false);
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-pinnacle-hover',
          'select-none'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <button onClick={handleToggle} className="flex items-center gap-1 flex-1">
          {isLoading ? (
            <div className="w-4 h-4 animate-spin border border-current border-t-transparent rounded-full" />
          ) : (
            <span className="flex-shrink-0">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
          <span className="flex-shrink-0 text-blue-400">
            {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
          </span>
          <span className="flex-1 truncate">{folder.name}</span>
        </button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onSelect(folder.path)}
          className="h-6 px-2 text-xs"
        >
          Select
        </Button>
      </div>
      {isExpanded && (
        <div>
          {children.map((child) => (
            <FolderItem
              key={child.path}
              folder={child}
              level={level + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </>
  );
}

export function FolderBrowser({ isOpen, onClose, onSelectFolder }: FolderBrowserProps) {
  const [rootFolders, setRootFolders] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRootFolders();
    }
  }, [isOpen]);

  const loadRootFolders = async () => {
    setIsLoading(true);
    try {
      // Load common root directories
      const commonPaths = ['C:\\', 'C:\\Users', 'C:\\Users\\Administrator\\Desktop'];
      const folders: FileItem[] = [];
      
      for (const path of commonPaths) {
        try {
          const items = await fileAPI.getFiles(path);
          const dirItems = items.filter(item => item.isDirectory);
          folders.push({
            name: path === 'C:\\' ? 'C: Drive' : path.split('\\').pop() || path,
            path,
            isDirectory: true,
            size: 0,
            modified: new Date()
          });
        } catch (error) {
          // Skip if path doesn't exist
        }
      }
      
      setRootFolders(folders);
    } catch (error) {
      console.error('Failed to load root folders:', error);
    }
    setIsLoading(false);
  };

  const handleSelect = (folderPath: string) => {
    onSelectFolder(folderPath);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-pinnacle-sidebar border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Select Folder</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96 pinnacle-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin border border-current border-t-transparent rounded-full w-6 h-6" />
            </div>
          ) : (
            <div className="py-2">
              {rootFolders.map((folder) => (
                <FolderItem
                  key={folder.path}
                  folder={folder}
                  level={0}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}