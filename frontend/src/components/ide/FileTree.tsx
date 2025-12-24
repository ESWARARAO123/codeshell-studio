import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2, Edit3, Copy, Clipboard } from 'lucide-react';
import { useEditor } from '@/context/EditorContext';
import { FileItem } from '@/lib/fileAPI';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface FileTreeItemProps {
  file: FileItem;
  level: number;
}

function FileTreeItem({ file, level }: FileTreeItemProps) {
  const { openFile, createFile, createFolder, deleteItem, renameItem } = useEditor();
  const [isExpanded, setIsExpanded] = useState(false);
  const [children, setChildren] = useState<FileItem[]>([]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);

  const handleClick = async () => {
    if (file.isDirectory) {
      setIsExpanded(!isExpanded);
      if (!isExpanded && children.length === 0) {
        try {
          const { fileAPI } = await import('@/lib/fileAPI');
          const childFiles = await fileAPI.getFiles(file.path);
          setChildren(childFiles);
        } catch (error) {
          console.error('Failed to load directory:', error);
        }
      }
    } else {
      openFile(file.path);
    }
  };

  const handleNewFile = async () => {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      const filePath = file.isDirectory ? `${file.path}/${fileName}` : `${file.path}/../${fileName}`;
      await createFile(filePath);
    }
  };

  const handleNewFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      const folderPath = file.isDirectory ? `${file.path}/${folderName}` : `${file.path}/../${folderName}`;
      await createFolder(folderPath);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Delete ${file.name}?`)) {
      await deleteItem(file.path);
    }
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(file.path).then(() => {
      console.log('Path copied to clipboard:', file.path);
    }).catch(err => {
      console.error('Failed to copy path:', err);
    });
  };

  const handleRename = async () => {
    if (newName && newName !== file.name) {
      try {
        const newPath = file.path.replace(file.name, newName);
        await renameItem(file.path, newPath);
      } catch (error) {
        console.error('Failed to rename:', error);
      }
    }
    setIsRenaming(false);
  };

  const getFileIcon = () => {
    if (file.isDirectory) {
      return isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />;
    }
    return <File size={16} />;
  };

  const getFileColor = () => {
    if (file.isDirectory) return 'text-blue-400';
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts': case 'tsx': return 'text-blue-400';
      case 'js': case 'jsx': return 'text-yellow-400';
      case 'json': return 'text-yellow-300';
      case 'html': return 'text-orange-400';
      case 'css': case 'scss': return 'text-purple-400';
      case 'md': return 'text-blue-300';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn(
              'file-tree-item group',
              'flex items-center gap-1 px-2 py-1 text-sm cursor-pointer',
              'hover:bg-pinnacle-hover transition-colors'
            )}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={handleClick}
          >
            {file.isDirectory && (
              <span className="flex-shrink-0">
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            )}
            <span className={cn('flex-shrink-0', getFileColor())}>
              {getFileIcon()}
            </span>
            {isRenaming ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') setIsRenaming(false);
                }}
                className="flex-1 bg-pinnacle-editor text-foreground px-1 rounded"
                autoFocus
              />
            ) : (
              <span className="flex-1 truncate">{file.name}</span>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-pinnacle-sidebar border-border">
          <ContextMenuItem onClick={handleNewFile} className="text-foreground hover:bg-pinnacle-hover">
            <Plus size={14} className="mr-2" />
            New File
          </ContextMenuItem>
          <ContextMenuItem onClick={handleNewFolder} className="text-foreground hover:bg-pinnacle-hover">
            <Folder size={14} className="mr-2" />
            New Folder
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-border" />
          <ContextMenuItem onClick={() => setIsRenaming(true)} className="text-foreground hover:bg-pinnacle-hover">
            <Edit3 size={14} className="mr-2" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem onClick={handleCopyPath} className="text-foreground hover:bg-pinnacle-hover">
            <Copy size={14} className="mr-2" />
            Copy Path
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-border" />
          <ContextMenuItem onClick={handleDelete} className="text-foreground hover:bg-pinnacle-hover">
            <Trash2 size={14} className="mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {file.isDirectory && isExpanded && (
        <div>
          {children.map((child) => (
            <FileTreeItem key={child.path} file={child} level={level + 1} />
          ))}
        </div>
      )}
    </>
  );
}

export function FileTree() {
  const { files } = useEditor();

  return (
    <div className="py-1">
      {files.map((file) => (
        <FileTreeItem key={file.path} file={file} level={0} />
      ))}
    </div>
  );
}