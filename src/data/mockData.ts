import { FileNode, TerminalLine } from '@/types/editor';

export const mockFileTree: FileNode[] = [
  {
    id: 'src',
    name: 'src',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: 'components',
        name: 'components',
        type: 'folder',
        isOpen: true,
        children: [
          {
            id: 'app-tsx',
            name: 'App.tsx',
            type: 'file',
            language: 'typescript',
            content: `import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';

export function App() {
  return (
    <div className="app-container">
      <Header />
      <div className="app-body">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  );
}

export default App;`,
          },
          {
            id: 'header-tsx',
            name: 'Header.tsx',
            type: 'file',
            language: 'typescript',
            content: `import React from 'react';

interface HeaderProps {
  title?: string;
}

export function Header({ title = 'My App' }: HeaderProps) {
  return (
    <header className="header">
      <h1>{title}</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
      </nav>
    </header>
  );
}`,
          },
        ],
      },
      {
        id: 'utils',
        name: 'utils',
        type: 'folder',
        children: [
          {
            id: 'helpers-ts',
            name: 'helpers.ts',
            type: 'file',
            language: 'typescript',
            content: `export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}`,
          },
        ],
      },
      {
        id: 'main-ts',
        name: 'main.ts',
        type: 'file',
        language: 'typescript',
        content: `import { App } from './components/App';
import { initializeApp } from './utils/init';

// Initialize the application
async function bootstrap() {
  try {
    await initializeApp();
    console.log('Application initialized successfully');
    
    // Mount the app
    const root = document.getElementById('root');
    if (root) {
      // Render application
      App();
    }
  } catch (error) {
    console.error('Failed to initialize:', error);
  }
}

bootstrap();`,
      },
    ],
  },
  {
    id: 'public',
    name: 'public',
    type: 'folder',
    children: [
      {
        id: 'index-html',
        name: 'index.html',
        type: 'file',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Application</title>
  <link rel="stylesheet" href="/styles/main.css">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>`,
      },
    ],
  },
  {
    id: 'package-json',
    name: 'package.json',
    type: 'file',
    language: 'json',
    content: `{
  "name": "my-vscode-project",
  "version": "1.0.0",
  "description": "A sample project",
  "main": "src/main.ts",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}`,
  },
  {
    id: 'readme-md',
    name: 'README.md',
    type: 'file',
    language: 'markdown',
    content: `# My VS Code Project

## Overview
This is a sample project demonstrating the VS Code-like interface.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features
- Modern TypeScript setup
- Component-based architecture
- Hot module replacement

## License
MIT`,
  },
];

export const mockTerminalHistory: TerminalLine[] = [
  {
    id: '1',
    type: 'info',
    content: 'Welcome to the integrated terminal',
    timestamp: new Date(),
  },
  {
    id: '2',
    type: 'input',
    content: '$ npm install',
    timestamp: new Date(),
  },
  {
    id: '3',
    type: 'output',
    content: 'added 156 packages in 3.2s',
    timestamp: new Date(),
  },
  {
    id: '4',
    type: 'input',
    content: '$ npm run dev',
    timestamp: new Date(),
  },
  {
    id: '5',
    type: 'output',
    content: `  VITE v5.0.0  ready in 342 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help`,
    timestamp: new Date(),
  },
];

export const mockProblems = [
  {
    id: '1',
    type: 'error' as const,
    file: 'src/components/App.tsx',
    line: 12,
    message: "Cannot find module './MainContent'",
  },
  {
    id: '2',
    type: 'warning' as const,
    file: 'src/utils/helpers.ts',
    line: 8,
    message: "'capitalize' is defined but never used",
  },
];
