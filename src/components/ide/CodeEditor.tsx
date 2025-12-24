import React from 'react';
import { useEditor } from '@/context/EditorContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface TokenStyle {
  className: string;
}

function tokenize(content: string, language: string): { text: string; style: TokenStyle }[][] {
  const lines = content.split('\n');
  
  return lines.map(line => {
    const tokens: { text: string; style: TokenStyle }[] = [];
    
    if (language === 'typescript' || language === 'javascript') {
      // Simple tokenization for demo
      let remaining = line;
      let match;
      
      while (remaining.length > 0) {
        // Comments
        if ((match = remaining.match(/^(\/\/.*)/))) {
          tokens.push({ text: match[1], style: { className: 'text-syntax-comment' } });
          remaining = remaining.slice(match[1].length);
        }
        // Strings
        else if ((match = remaining.match(/^("[^"]*"|'[^']*'|`[^`]*`)/))) {
          tokens.push({ text: match[1], style: { className: 'text-syntax-string' } });
          remaining = remaining.slice(match[1].length);
        }
        // Keywords
        else if ((match = remaining.match(/^(import|export|from|const|let|var|function|return|if|else|async|await|try|catch|throw|new|class|extends|interface|type|default)\b/))) {
          tokens.push({ text: match[1], style: { className: 'text-syntax-keyword' } });
          remaining = remaining.slice(match[1].length);
        }
        // Types/Classes
        else if ((match = remaining.match(/^([A-Z][a-zA-Z0-9]*)/))) {
          tokens.push({ text: match[1], style: { className: 'text-syntax-type' } });
          remaining = remaining.slice(match[1].length);
        }
        // Functions
        else if ((match = remaining.match(/^([a-z][a-zA-Z0-9]*)\s*(?=\()/))) {
          tokens.push({ text: match[1], style: { className: 'text-syntax-function' } });
          remaining = remaining.slice(match[1].length);
        }
        // Numbers
        else if ((match = remaining.match(/^(\d+\.?\d*)/))) {
          tokens.push({ text: match[1], style: { className: 'text-syntax-number' } });
          remaining = remaining.slice(match[1].length);
        }
        // Variables and identifiers
        else if ((match = remaining.match(/^([a-z][a-zA-Z0-9]*)/))) {
          tokens.push({ text: match[1], style: { className: 'text-syntax-variable' } });
          remaining = remaining.slice(match[1].length);
        }
        // Other characters
        else {
          tokens.push({ text: remaining[0], style: { className: 'text-foreground' } });
          remaining = remaining.slice(1);
        }
      }
    } else if (language === 'json') {
      let remaining = line;
      let match;
      
      while (remaining.length > 0) {
        if ((match = remaining.match(/^("[^"]*")\s*:/))) {
          tokens.push({ text: match[1], style: { className: 'text-syntax-variable' } });
          remaining = remaining.slice(match[1].length);
        } else if ((match = remaining.match(/^("[^"]*")/))) {
          tokens.push({ text: match[1], style: { className: 'text-syntax-string' } });
          remaining = remaining.slice(match[1].length);
        } else if ((match = remaining.match(/^(\d+\.?\d*)/))) {
          tokens.push({ text: match[1], style: { className: 'text-syntax-number' } });
          remaining = remaining.slice(match[1].length);
        } else if ((match = remaining.match(/^(true|false|null)/))) {
          tokens.push({ text: match[1], style: { className: 'text-syntax-keyword' } });
          remaining = remaining.slice(match[1].length);
        } else {
          tokens.push({ text: remaining[0], style: { className: 'text-foreground' } });
          remaining = remaining.slice(1);
        }
      }
    } else if (language === 'html') {
      let remaining = line;
      let match;
      
      while (remaining.length > 0) {
        if ((match = remaining.match(/^(<\/?[a-zA-Z][a-zA-Z0-9]*)/))) {
          tokens.push({ text: match[1], style: { className: 'text-syntax-keyword' } });
          remaining = remaining.slice(match[1].length);
        } else if ((match = remaining.match(/^([a-zA-Z-]+)(?==)/))) {
          tokens.push({ text: match[1], style: { className: 'text-syntax-variable' } });
          remaining = remaining.slice(match[1].length);
        } else if ((match = remaining.match(/^("[^"]*")/))) {
          tokens.push({ text: match[1], style: { className: 'text-syntax-string' } });
          remaining = remaining.slice(match[1].length);
        } else if ((match = remaining.match(/^(>|\/>)/))) {
          tokens.push({ text: match[1], style: { className: 'text-syntax-keyword' } });
          remaining = remaining.slice(match[1].length);
        } else {
          tokens.push({ text: remaining[0], style: { className: 'text-foreground' } });
          remaining = remaining.slice(1);
        }
      }
    } else {
      tokens.push({ text: line, style: { className: 'text-foreground' } });
    }
    
    return tokens;
  });
}

export function CodeEditor() {
  const { openTabs, activeTabId } = useEditor();
  
  const activeTab = openTabs.find(tab => tab.id === activeTabId);

  if (!activeTab) {
    return (
      <div className="flex-1 flex items-center justify-center bg-vscode-editor text-muted-foreground">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-20">VS</div>
          <p className="text-lg">Visual Studio Code</p>
          <p className="text-sm mt-2">Open a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  const tokenizedLines = tokenize(activeTab.content, activeTab.language);

  return (
    <ScrollArea className="flex-1 bg-vscode-editor vscode-scrollbar">
      <div className="min-w-fit">
        {tokenizedLines.map((lineTokens, lineIndex) => (
          <div key={lineIndex} className="code-line flex">
            <span className="w-12 text-right pr-4 text-[hsl(var(--vscode-line-number))] select-none flex-shrink-0">
              {lineIndex + 1}
            </span>
            <span className="flex-1 whitespace-pre">
              {lineTokens.length === 0 ? (
                <span>&nbsp;</span>
              ) : (
                lineTokens.map((token, tokenIndex) => (
                  <span key={tokenIndex} className={token.style.className}>
                    {token.text}
                  </span>
                ))
              )}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
