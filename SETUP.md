# Pinnacle IDE

A modern web-based IDE with real file system integration.

## Features

- Real file system access (read, write, create, delete)
- Syntax highlighting for multiple languages
- File explorer with create/delete operations
- Integrated terminal
- Tabbed editor with save functionality (Ctrl+S)
- Resizable panels

## Setup

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Run the Application

**Option 1: Run both frontend and backend together**
```bash
npm run dev:full
```

**Option 2: Run separately**
```bash
# Terminal 1 - Backend server
npm run server

# Terminal 2 - Frontend
npm run dev
```

### 3. Access the IDE

- Frontend: http://localhost:5174
- Backend API: http://localhost:3001

## File Operations

- **Open File**: Click on any file in the explorer
- **Create File**: Right-click on folder → New File (or use + button)
- **Create Folder**: Right-click on folder → New Folder
- **Save File**: Ctrl+S or click the modified indicator (dot) on tab
- **Delete**: Right-click on file/folder → Delete

## API Endpoints

- `GET /api/files?path=<dir>` - List files in directory
- `GET /api/file?path=<file>` - Read file content
- `POST /api/file` - Save file content
- `POST /api/file/new` - Create new file
- `POST /api/folder/new` - Create new folder
- `DELETE /api/file` - Delete file or folder

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js
- **File System**: Native Node.js fs module