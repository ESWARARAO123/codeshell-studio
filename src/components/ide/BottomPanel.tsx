import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, FileOutput, AlertCircle, X, ChevronUp, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useEditor } from '@/context/EditorContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { mockProblems } from '@/data/mockData';

function TerminalTab() {
  const { terminalHistory, addTerminalLine } = useEditor();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    addTerminalLine({ type: 'input', content: `$ ${input}` });
    
    // Mock command responses
    if (input === 'clear') {
      // Would need to implement clear
    } else if (input === 'ls') {
      addTerminalLine({ type: 'output', content: 'src/  public/  package.json  README.md  vite.config.ts' });
    } else if (input.startsWith('echo ')) {
      addTerminalLine({ type: 'output', content: input.slice(5) });
    } else if (input === 'pwd') {
      addTerminalLine({ type: 'output', content: '/home/user/my-vscode-project' });
    } else if (input === 'node -v') {
      addTerminalLine({ type: 'output', content: 'v20.10.0' });
    } else if (input === 'npm -v') {
      addTerminalLine({ type: 'output', content: '10.2.3' });
    } else {
      addTerminalLine({ type: 'error', content: `zsh: command not found: ${input.split(' ')[0]}` });
    }
    
    setInput('');
  };

  const handleClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-vscode-terminal" onClick={handleClick}>
      <ScrollArea ref={scrollRef} className="flex-1 p-2 font-mono text-sm vscode-scrollbar">
        {terminalHistory.map((line) => (
          <div
            key={line.id}
            className={cn(
              'terminal-line',
              line.type === 'error' && 'text-destructive',
              line.type === 'info' && 'text-syntax-comment',
              line.type === 'input' && 'text-syntax-function',
              line.type === 'output' && 'text-foreground'
            )}
          >
            <pre className="whitespace-pre-wrap">{line.content}</pre>
          </div>
        ))}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
          <span className="text-syntax-function">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-foreground"
            autoFocus
          />
          <span className="w-2 h-4 bg-foreground animate-cursor-blink" />
        </form>
      </ScrollArea>
    </div>
  );
}

function OutputTab() {
  return (
    <div className="flex-1 p-2 bg-vscode-terminal font-mono text-sm">
      <div className="text-muted-foreground">
        [2024-01-15 10:30:45] Server started on port 5173
      </div>
      <div className="text-muted-foreground">
        [2024-01-15 10:30:46] Watching for file changes...
      </div>
      <div className="text-syntax-number">
        [2024-01-15 10:31:02] Build completed in 342ms
      </div>
    </div>
  );
}

function ProblemsTab() {
  return (
    <div className="flex-1 bg-vscode-terminal">
      <ScrollArea className="h-full vscode-scrollbar">
        {mockProblems.map((problem) => (
          <div
            key={problem.id}
            className="flex items-start gap-2 px-2 py-1 hover:bg-vscode-hover cursor-pointer text-sm"
          >
            <AlertCircle
              size={14}
              className={cn(
                'mt-0.5 flex-shrink-0',
                problem.type === 'error' ? 'text-destructive' : 'text-yellow-500'
              )}
            />
            <div className="flex-1 min-w-0">
              <span className="text-foreground">{problem.message}</span>
              <span className="text-muted-foreground ml-2">
                [{problem.file}:{problem.line}]
              </span>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}

export function BottomPanel() {
  const { bottomPanelTab, setBottomPanelTab, isBottomPanelOpen, toggleBottomPanel } = useEditor();

  const tabs = [
    { id: 'terminal' as const, label: 'Terminal', icon: TerminalIcon },
    { id: 'output' as const, label: 'Output', icon: FileOutput },
    { id: 'problems' as const, label: 'Problems', icon: AlertCircle, count: mockProblems.length },
  ];

  if (!isBottomPanelOpen) {
    return null;
  }

  return (
    <div className="flex flex-col h-full border-t border-border">
      <div className="flex items-center justify-between bg-vscode-sidebar px-2">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setBottomPanelTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wide transition-colors',
                bottomPanelTab === tab.id
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon size={14} />
              {tab.label}
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-vscode-hover rounded">
            <Plus size={14} className="text-muted-foreground" />
          </button>
          <button className="p-1 hover:bg-vscode-hover rounded">
            <Trash2 size={14} className="text-muted-foreground" />
          </button>
          <button onClick={toggleBottomPanel} className="p-1 hover:bg-vscode-hover rounded">
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>
          <button onClick={toggleBottomPanel} className="p-1 hover:bg-vscode-hover rounded">
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {bottomPanelTab === 'terminal' && <TerminalTab />}
        {bottomPanelTab === 'output' && <OutputTab />}
        {bottomPanelTab === 'problems' && <ProblemsTab />}
      </div>
    </div>
  );
}
