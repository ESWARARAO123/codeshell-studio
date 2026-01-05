const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3010;

app.use(cors());
app.use(express.json());

const workspaceRoot = process.cwd();

// Initialize RAG system on server startup
let globalAgent = null;

async function initializeAgent() {
  try {
    console.log('🚀 Starting Pinnacle Agent with RAG...');
    const { PinnacleAgent } = require('./agent/pinnacleAgent');
    globalAgent = new PinnacleAgent();
    
    // Wait a bit for RAG to initialize
    setTimeout(() => {
      console.log('🎆 Pinnacle Agent ready!');
    }, 2000);
  } catch (error) {
    console.error('❌ Failed to initialize agent:', error);
  }
}

// Initialize agent on startup
initializeAgent();

// Get file tree
app.get('/api/files', async (req, res) => {
  try {
    const dirPath = req.query.path;
    if (!dirPath) {
      // Return common root directories for Windows
      const rootDirs = [];
      
      // Try to access common directories
      const commonPaths = [
        { name: 'Current Project', path: process.cwd() },
        { name: 'Desktop', path: 'C:\\Users\\Administrator\\Desktop' },
        { name: 'Documents', path: 'C:\\Users\\Administrator\\Documents' },
        { name: 'C: Drive', path: 'C:\\' }
      ];
      
      for (const dir of commonPaths) {
        try {
          await fs.access(dir.path);
          rootDirs.push({
            name: dir.name,
            path: dir.path,
            isDirectory: true,
            size: 0,
            modified: new Date()
          });
        } catch (error) {
          // Skip if directory doesn't exist or no access
        }
      }
      
      return res.json(rootDirs);
    }
    
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    
    const files = await Promise.all(
      items.map(async (item) => {
        try {
          const fullPath = path.join(dirPath, item.name);
          const stats = await fs.stat(fullPath);
          
          return {
            name: item.name,
            path: fullPath,
            isDirectory: item.isDirectory(),
            size: stats.size,
            modified: stats.mtime
          };
        } catch (error) {
          return null;
        }
      })
    );
    
    res.json(files.filter(f => f && !f.name.startsWith('.')));
  } catch (error) {
    console.error('File API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Read file content
app.get('/api/file', async (req, res) => {
  try {
    const filePath = req.query.path;
    const content = await fs.readFile(filePath, 'utf8');
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save file content
app.post('/api/file', async (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    await fs.writeFile(filePath, content, 'utf8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new file
app.post('/api/file/new', async (req, res) => {
  try {
    const { path: filePath, content = '' } = req.body;
    await fs.writeFile(filePath, content, 'utf8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new folder
app.post('/api/folder/new', async (req, res) => {
  try {
    const { path: folderPath } = req.body;
    await fs.mkdir(folderPath, { recursive: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rename file or folder
app.put('/api/file/rename', async (req, res) => {
  try {
    const { oldPath, newPath } = req.body;
    await fs.rename(oldPath, newPath);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete file or folder
app.delete('/api/file', async (req, res) => {
  try {
    const { path: itemPath } = req.body;
    const stats = await fs.stat(itemPath);
    
    if (stats.isDirectory()) {
      await fs.rmdir(itemPath, { recursive: true });
    } else {
      await fs.unlink(itemPath);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agent status endpoint
app.get('/api/agent/status', (req, res) => {
  const status = {
    agent_ready: globalAgent !== null,
    rag_ready: globalAgent ? globalAgent.ragReady : false,
    timestamp: new Date().toISOString()
  };
  res.json(status);
});

// Agent endpoints
app.post('/api/agent/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Use global agent if available, otherwise create new one
    let agent = globalAgent;
    if (!agent) {
      const { PinnacleAgent } = require('./agent/pinnacleAgent');
      agent = new PinnacleAgent();
    }
    
    const response = await agent.processRequest(message, context);
    
    // Handle file operations if present
    if (response.fileAction) {
      try {
        const { action, filename, content, modifications } = response.fileAction;
        
        if (action === 'modify_active_file') {
          // For active file modifications, let frontend handle confirmation
          // Don't modify the file here, just pass the action to frontend
          response.response = `I want to modify ${filename}. Please confirm the changes.`;
        } else if (action === 'modify_open_files' && modifications) {
          // Handle modifications to open files
          const fileModifications = [];
          for (const mod of modifications) {
            await fs.writeFile(mod.filepath, mod.content, 'utf8');
            fileModifications.push(mod);
          }
          response.fileModifications = fileModifications;
          response.response = `✅ Modified ${modifications.length} file(s)\n\n${response.fileAction.message || ''}`;
        } else if (action === 'create_file' && filename && content) {
          // Handle new file creation
          const workspacePath = process.cwd();
          const filePath = path.join(workspacePath, filename);
          await fs.writeFile(filePath, content, 'utf8');
          response.response = `✅ File created: ${filename}\n\n${response.fileAction.message || ''}`;
          response.filePath = filePath;
        }
      } catch (fileError) {
        console.error('File operation error:', fileError);
        response.response += `\n\n❌ File operation failed: ${fileError.message}`;
      }
    }
    
    // Try to parse JSON response if it looks like JSON
    if (response.response && response.response.trim().startsWith('{')) {
      try {
        const parsedAction = JSON.parse(response.response);
        if (parsedAction.action === 'modify_active_file') {
          response.fileAction = parsedAction;
          response.response = `I want to modify ${parsedAction.filename}. Please confirm the changes.`;
        } else if (parsedAction.action === 'integrate_code') {
          response.integrateAction = {
            code: parsedAction.code,
            targetFile: parsedAction.targetFile
          };
          response.response = `${parsedAction.message}\n\n\`\`\`verilog\n${parsedAction.code}\n\`\`\``;
        }
      } catch (e) {
        // If parsing fails, keep original response
      }
    }
    
    res.json(response);
  } catch (error) {
    console.error('Agent chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/agent/generate', async (req, res) => {
  try {
    const { prompt, language } = req.body;
    
    // Use global agent if available, otherwise create new one
    let agent = globalAgent;
    if (!agent) {
      const { PinnacleAgent } = require('./agent/pinnacleAgent');
      agent = new PinnacleAgent();
    }
    
    const response = await agent.processRequest(prompt);
    res.json(response);
  } catch (error) {
    console.error('Agent generate error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying ${PORT + 1}...`);
    app.listen(PORT + 1, () => {
      console.log(`Server running on http://localhost:${PORT + 1}`);
    });
  } else {
    console.error('Server error:', err);
  }
});