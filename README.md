# Pinnacle IDE

A modern web-based IDE with real file system integration.

## Project Structure

```
codeshell-studio/
├── frontend/           # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── index.js           # Express backend server
├── package.json       # Backend dependencies & scripts
└── README.md
```

## Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- Ollama with CodeLlama model

### 1. Install Ollama and CodeLlama
```bash
# Install Ollama (if not already installed)
# Visit: https://ollama.ai/download

# Pull CodeLlama model
ollama pull codellama

# Start Ollama service
ollama serve
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 4. Run the Application

**Option 1: Quick start with checks**
```bash
npm run startup
```

**Option 2: Run both frontend and backend together**
```bash
npm run dev:full
```

**Option 3: Run separately**
```bash
# Terminal 1 - Backend server
npm run dev

# Terminal 2 - Frontend
npm run frontend
```

### 5. Test Agent Functionality
```bash
# Test all agents
npm run test-agents

# Test API connectivity
curl http://localhost:3001/api/agent/test
```

## Access Points

- **Frontend**: http://localhost:5174 (or the port shown in terminal)
- **Backend API**: http://localhost:3001

## Features

- Real file system access (read, write, create, delete)
- Syntax highlighting for multiple languages
- File explorer with create/delete operations
- Integrated terminal
- Tabbed editor with save functionality (Ctrl+S)
- Resizable panels
- **AI-Powered Agents**:
  - **Code Review Agent**: Analyzes code for bugs, security issues, and best practices
  - **Code Suggestion Agent**: Provides intelligent code completions and improvements
  - **Code Generation Agent**: Generates complete code from descriptions
  - **Pinnacle Agent**: General-purpose coding assistant

## AI Agent System

The IDE includes a powerful AI agent system powered by CodeLlama:

- **Real-time code analysis** and suggestions
- **Context-aware** responses based on your current file
- **Multiple specialized agents** for different tasks
- **Fallback responses** when Ollama is unavailable
- **Quick actions** for common tasks

### Agent Types
1. **Code Review Agent** - Finds bugs, security issues, performance problems
2. **Code Suggestion Agent** - Provides smart completions and improvements
3. **Code Generation Agent** - Creates code from natural language descriptions
4. **Pinnacle Agent** - General coding assistance and explanations

## File Operations

- **Open File**: Click on any file in the explorer
- **Create File**: Right-click on folder → New File (or use + button)
- **Create Folder**: Right-click on folder → New Folder
- **Save File**: Ctrl+S or click the modified indicator (dot) on tab
- **Delete**: Right-click on file/folder → Delete

## Troubleshooting

If agents are not responding:

1. **Check Ollama service**: `ollama serve`
2. **Verify CodeLlama model**: `ollama list`
3. **Test agents**: `npm run test-agents`
4. **Check connectivity**: `curl http://localhost:3001/api/agent/test`

For detailed troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js
- **File System**: Native Node.js fs module