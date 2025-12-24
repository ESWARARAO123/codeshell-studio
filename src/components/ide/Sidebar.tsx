import React from 'react';
import { ChevronDown, Search, MoreHorizontal, RefreshCw, Plus, GitBranch, GitCommit, Play, Puzzle } from 'lucide-react';
import { useEditor } from '@/context/EditorContext';
import { FileTree } from './FileTree';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

function ExplorerView() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Explorer</span>
        <div className="flex gap-1">
          <button className="p-1 hover:bg-vscode-hover rounded">
            <Plus size={14} />
          </button>
          <button className="p-1 hover:bg-vscode-hover rounded">
            <RefreshCw size={14} />
          </button>
          <button className="p-1 hover:bg-vscode-hover rounded">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-1 px-2 py-1 text-sm hover:bg-vscode-hover cursor-pointer">
        <ChevronDown size={16} />
        <span className="font-semibold">MY-VSCODE-PROJECT</span>
      </div>
      <ScrollArea className="flex-1 vscode-scrollbar">
        <FileTree />
      </ScrollArea>
    </div>
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
          className="h-7 bg-vscode-editor border-border text-sm"
        />
      </div>
      <div className="px-2 py-1">
        <Input
          placeholder="Replace"
          className="h-7 bg-vscode-editor border-border text-sm"
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
          <button className="p-1 hover:bg-vscode-hover rounded">
            <RefreshCw size={14} />
          </button>
          <button className="p-1 hover:bg-vscode-hover rounded">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
      <div className="px-2 py-2">
        <Input
          placeholder="Message (Ctrl+Enter to commit)"
          className="h-7 bg-vscode-editor border-border text-sm"
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
        <button className="p-1 hover:bg-vscode-hover rounded">
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
          className="h-7 bg-vscode-editor border-border text-sm"
        />
      </div>
      <ScrollArea className="flex-1 vscode-scrollbar">
        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
          INSTALLED
        </div>
        {extensions.filter(e => e.installed).map((ext) => (
          <div key={ext.name} className="flex items-center gap-2 px-2 py-2 hover:bg-vscode-hover cursor-pointer">
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
          <div key={ext.name} className="flex items-center gap-2 px-2 py-2 hover:bg-vscode-hover cursor-pointer">
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
      default:
        return <ExplorerView />;
    }
  };

  return (
    <div className="h-full bg-vscode-sidebar border-r border-border">
      {renderView()}
    </div>
  );
}
