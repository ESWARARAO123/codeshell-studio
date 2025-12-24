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

### 1. Install Backend Dependencies
```bash
npm install
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 3. Run the Application

**Option 1: Run both frontend and backend together**
```bash
npm run dev:full
```

**Option 2: Run separately**
```bash
# Terminal 1 - Backend server
npm run dev

# Terminal 2 - Frontend
npm run frontend
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

## File Operations

- **Open File**: Click on any file in the explorer
- **Create File**: Right-click on folder → New File (or use + button)
- **Create Folder**: Right-click on folder → New Folder
- **Save File**: Ctrl+S or click the modified indicator (dot) on tab
- **Delete**: Right-click on file/folder → Delete

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js
- **File System**: Native Node.js fs module