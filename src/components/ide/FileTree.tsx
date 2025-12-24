import React from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import { FileNode } from '@/types/editor';
import { useEditor } from '@/context/EditorContext';
import { cn } from '@/lib/utils';

interface FileTreeItemProps {
  node: FileNode;
  depth?: number;
}

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

function FileTreeItem({ node, depth = 0 }: FileTreeItemProps) {
  const { toggleFolder, openFile, selectedFileId } = useEditor();
  const isFolder = node.type === 'folder';
  const isOpen = node.isOpen;
  const isSelected = selectedFileId === node.id;
  const fileStyle = !isFolder ? getFileIcon(node.name) : null;

  const handleClick = () => {
    if (isFolder) {
      toggleFolder(node.id);
    } else {
      openFile(node);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={cn(
          'file-tree-item',
          isSelected && 'active'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isFolder ? (
          <>
            {isOpen ? (
              <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
            )}
            {isOpen ? (
              <FolderOpen size={16} className="text-yellow-500 flex-shrink-0" />
            ) : (
              <Folder size={16} className="text-yellow-500 flex-shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-4" />
            <File size={16} className={cn('flex-shrink-0', fileStyle?.color)} />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree() {
  const { fileTree } = useEditor();

  return (
    <div className="py-1">
      {fileTree.map((node) => (
        <FileTreeItem key={node.id} node={node} />
      ))}
    </div>
  );
}
