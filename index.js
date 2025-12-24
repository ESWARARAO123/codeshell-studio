const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const workspaceRoot = process.cwd();

// Get file tree
app.get('/api/files', async (req, res) => {
  try {
    const dirPath = req.query.path;
    if (!dirPath) {
      return res.json([]);
    }
    
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    
    const files = await Promise.all(
      items.map(async (item) => {
        const fullPath = path.join(dirPath, item.name);
        const stats = await fs.stat(fullPath);
        
        return {
          name: item.name,
          path: fullPath,
          isDirectory: item.isDirectory(),
          size: stats.size,
          modified: stats.mtime
        };
      })
    );
    
    res.json(files.filter(f => !f.name.startsWith('.')));
  } catch (error) {
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

// Agent endpoints
app.post('/api/agent/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    const { PinnacleAgent } = require('./agent/pinnacleAgent');
    
    const agent = new PinnacleAgent();
    const response = await agent.processRequest(message, context);
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/agent/generate', async (req, res) => {
  try {
    const { prompt, language } = req.body;
    const { PinnacleAgent } = require('./agent/pinnacleAgent');
    
    const agent = new PinnacleAgent();
    const response = await agent.generateCode(prompt, language);
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});