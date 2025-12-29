# Pinnacle IDE

A modern web-based IDE with real file system integration and AI-powered multi-agent system.

## Project Structure

```
codeshell-studio/
├── frontend/           # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── agent/             # Multi-agent AI system
│   ├── geminiService.js
│   ├── multiAgentOrchestrator.js
│   └── ...
├── index.js           # Express backend server
├── package.json       # Backend dependencies & scripts
└── README.md
```

## Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- Google Gemini API key

### 1. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file and add your Gemini API key
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Install Backend Dependencies
```bash
npm install
```

### 4. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 5. Run the Application

**Option 1: Quick start**
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

### 6. Test Multi-Agent System
```bash
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
- **AI-Powered Multi-Agent System**:
  - **Automatic Agent Selection**: System intelligently chooses the right agents based on your request
  - **Code Review**: Analyzes code for bugs, security issues, and best practices
  - **Code Generation**: Creates code from natural language descriptions
  - **Code Suggestions**: Provides intelligent improvements and optimizations
  - **File Editing**: Automatically edits files based on your requirements
  - **Collaborative Agents**: Multiple agents work together on complex tasks

## Multi-Agent AI System

The IDE includes a powerful multi-agent AI system powered by Google Gemini:

- **Intelligent Agent Orchestration** - Automatically selects and coordinates multiple agents
- **Real-time Code Analysis** and suggestions
- **Context-aware** responses based on your current file
- **Automatic File Editing** - Agents can modify files directly
- **Collaborative Problem Solving** - Multiple agents work together
- **Natural Language Interface** - Just describe what you want

### How It Works
1. **You ask a question** - "Review and improve this Python function"
2. **System analyzes** your request and current file context
3. **Multiple agents activate** - Review agent finds issues, Suggestion agent provides improvements
4. **Agents collaborate** - Results are combined into a comprehensive response
5. **Files are updated** - If requested, agents can edit your files directly

### Agent Capabilities
- **Review Agent** - Finds bugs, security issues, performance problems
- **Generation Agent** - Creates new code from descriptions
- **Suggestion Agent** - Provides improvements and optimizations
- **File System Agent** - Edits and manages project files

## File Operations

- **Open File**: Click on any file in the explorer
- **Create File**: Right-click on folder → New File (or use + button)
- **Create Folder**: Right-click on folder → New Folder
- **Save File**: Ctrl+S or click the modified indicator (dot) on tab
- **Delete**: Right-click on file/folder → Delete

## Troubleshooting

If the multi-agent system is not responding:

1. **Check Gemini API Key**: Ensure `GEMINI_API_KEY` is set in your `.env` file
2. **Verify API Key**: Test your key at [Google AI Studio](https://makersuite.google.com/)
3. **Check Internet Connection**: Gemini API requires internet access
4. **Test Connectivity**: `curl http://localhost:3001/api/agent/test`
5. **Check Logs**: Look at server console for error messages

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js
- **AI**: Google Gemini Pro API
- **File System**: Native Node.js fs module
- **Multi-Agent**: Custom orchestration system