import React from 'react';
import { ChevronDown, Search, MoreHorizontal, RefreshCw, Plus, GitBranch, GitCommit, Play, Puzzle, Folder, File } from 'lucide-react';
import { useEditor } from '@/context/EditorContext';
import { FileTree } from './FileTree';
import { FolderBrowser } from './FolderBrowser';
import { AgentView } from './AgentView';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function ExplorerView() {
  const { createFile, createFolder, openWorkspace, currentWorkspace, files } = useEditor();
  const [showFolderBrowser, setShowFolderBrowser] = React.useState(false);

  const handleOpenFolder = () => {
    setShowFolderBrowser(true);
  };

  const handleSelectFolder = async (folderPath: string) => {
    await openWorkspace(folderPath);
  };

  const handleNewFile = async () => {
    if (!currentWorkspace) {
      alert('Please open a workspace first');
      return;
    }
    const fileName = prompt('Enter file name:');
    if (fileName) {
      await createFile(`${currentWorkspace}/${fileName}`);
    }
  };

  const handleNewFolder = async () => {
    if (!currentWorkspace) {
      alert('Please open a workspace first');
      return;
    }
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      await createFolder(`${currentWorkspace}/${folderName}`);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Explorer</span>
          <div className="flex gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="p-1 hover:bg-pinnacle-hover rounded"
                  title="New..."
                  disabled={!currentWorkspace}
                >
                  <Plus size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-pinnacle-sidebar border-border">
                <DropdownMenuItem onClick={handleNewFile} className="text-foreground hover:bg-pinnacle-hover">
                  <File size={14} className="mr-2" />
                  New File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleNewFolder} className="text-foreground hover:bg-pinnacle-hover">
                  <Folder size={14} className="mr-2" />
                  New Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button 
              onClick={handleOpenFolder}
              className="p-1 hover:bg-pinnacle-hover rounded"
              title="Open Folder"
            >
              <RefreshCw size={14} />
            </button>
            <button className="p-1 hover:bg-pinnacle-hover rounded">
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>
        
        {!currentWorkspace ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <Folder size={48} className="text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              You have not yet opened a folder.
            </p>
            <button 
              onClick={handleOpenFolder}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Open Folder
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-2 py-1 text-sm hover:bg-pinnacle-hover cursor-pointer group">
              <div className="flex items-center gap-1">
                <ChevronDown size={16} />
                <span className="font-semibold">{currentWorkspace.split(/[\\/]/).pop()?.toUpperCase()}</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                <button 
                  onClick={handleNewFile}
                  className="p-1 hover:bg-pinnacle-selection rounded"
                  title="New File"
                >
                  <File size={12} />
                </button>
                <button 
                  onClick={handleNewFolder}
                  className="p-1 hover:bg-pinnacle-selection rounded"
                  title="New Folder"
                >
                  <Folder size={12} />
                </button>
              </div>
            </div>
            <ScrollArea className="flex-1 pinnacle-scrollbar">
              {files.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No files in this workspace
                </div>
              ) : (
                <FileTree />
              )}
            </ScrollArea>
          </>
        )}
      </div>
      
      <FolderBrowser
        isOpen={showFolderBrowser}
        onClose={() => setShowFolderBrowser(false)}
        onSelectFolder={handleSelectFolder}
      />
    </>
  );
}

function SearchView() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Search
      </div>
      <div className="px-2 py-1">
        <Input
          placeholder="Search"
          className="h-7 bg-pinnacle-editor border-border text-sm"
        />
      </div>
      <div className="px-2 py-1">
        <Input
          placeholder="Replace"
          className="h-7 bg-pinnacle-editor border-border text-sm"
        />
      </div>
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Enter search term to find results
      </div>
    </div>
  );
}

function GitView() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Source Control</span>
        <div className="flex gap-1">
          <button className="p-1 hover:bg-pinnacle-hover rounded">
            <RefreshCw size={14} />
          </button>
          <button className="p-1 hover:bg-pinnacle-hover rounded">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
      <div className="px-2 py-2">
        <Input
          placeholder="Message (Ctrl+Enter to commit)"
          className="h-7 bg-pinnacle-editor border-border text-sm"
        />
      </div>
      <div className="px-4 py-2 flex items-center gap-2 text-sm text-muted-foreground">
        <GitBranch size={14} />
        <span>main</span>
      </div>
      <div className="px-4 py-1 text-xs text-muted-foreground">
        <GitCommit size={12} className="inline mr-1" />
        No changes detected
      </div>
    </div>
  );
}

function RunView() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Run and Debug</span>
        <button className="p-1 hover:bg-pinnacle-hover rounded">
          <MoreHorizontal size={14} />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <Play size={48} className="text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-2">
          Run and Debug
        </p>
        <p className="text-xs text-muted-foreground">
          To customize Run and Debug create a launch.json file.
        </p>
      </div>
    </div>
  );
}

function ExtensionsView() {
  const extensions = [
    { name: 'Python', publisher: 'Microsoft', installed: true },
    { name: 'Prettier', publisher: 'Prettier', installed: true },
    { name: 'ESLint', publisher: 'Microsoft', installed: true },
    { name: 'GitLens', publisher: 'GitKraken', installed: false },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Extensions
      </div>
      <div className="px-2 py-1">
        <Input
          placeholder="Search Extensions in Marketplace"
          className="h-7 bg-pinnacle-editor border-border text-sm"
        />
      </div>
      <ScrollArea className="flex-1 pinnacle-scrollbar">
        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
          INSTALLED
        </div>
        {extensions.filter(e => e.installed).map((ext) => (
          <div key={ext.name} className="flex items-center gap-2 px-2 py-2 hover:bg-pinnacle-hover cursor-pointer">
            <Puzzle size={32} className="text-primary" />
            <div className="flex-1">
              <div className="text-sm font-medium">{ext.name}</div>
              <div className="text-xs text-muted-foreground">{ext.publisher}</div>
            </div>
          </div>
        ))}
        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mt-2">
          RECOMMENDED
        </div>
        {extensions.filter(e => !e.installed).map((ext) => (
          <div key={ext.name} className="flex items-center gap-2 px-2 py-2 hover:bg-pinnacle-hover cursor-pointer">
            <Puzzle size={32} className="text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">{ext.name}</div>
              <div className="text-xs text-muted-foreground">{ext.publisher}</div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}

export function Sidebar() {
  const { activeView, isSidebarOpen } = useEditor();

  if (!isSidebarOpen) return null;

  const renderView = () => {
    switch (activeView) {
      case 'explorer':
        return <ExplorerView />;
      case 'search':
        return <SearchView />;
      case 'git':
        return <GitView />;
      case 'run':
        return <RunView />;
      case 'extensions':
        return <ExtensionsView />;
      case 'agent':
        return <AgentView />;
      default:
        return <ExplorerView />;
    }
  };

  return (
    <div className="h-full bg-pinnacle-sidebar border-r border-border">
      {renderView()}
    </div>
  );
}
