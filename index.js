require('dotenv').config();
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const http = require('http');
const { detectLanguage, getExecutionCommand } = require('./utils/languageDetector');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3001;

app.use(cors());
app.use(express.json());

const workspaceRoot = process.cwd();

// Terminal WebSocket handling
wss.on('connection', (ws) => {
  console.log('Terminal WebSocket connected');
  
  let terminal = null;
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'start') {
      // Start terminal process
      const shell = process.platform === 'win32' ? 'cmd.exe' : 'bash';
      terminal = spawn(shell, [], {
        cwd: workspaceRoot,
        env: process.env
      });
      
      terminal.stdout.on('data', (data) => {
        ws.send(JSON.stringify({ type: 'output', data: data.toString() }));
      });
      
      terminal.stderr.on('data', (data) => {
        ws.send(JSON.stringify({ type: 'output', data: data.toString() }));
      });
      
      terminal.on('close', (code) => {
        ws.send(JSON.stringify({ type: 'close', code }));
      });
      
      ws.send(JSON.stringify({ type: 'ready' }));
    } else if (data.type === 'input' && terminal) {
      terminal.stdin.write(data.data);
    }
  });
  
  ws.on('close', () => {
    console.log('Terminal WebSocket disconnected');
    if (terminal) {
      terminal.kill();
    }
  });
});

// Get file tree
app.get('/api/files', async (req, res) => {
  try {
    const dirPath = req.query.path;
    console.log('API request for path:', dirPath);
    
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
    
    const filteredFiles = files.filter(f => !f.name.startsWith('.'));
    console.log(`Found ${files.length} items, returning ${filteredFiles.length} after filtering`);
    
    res.json(filteredFiles);
  } catch (error) {
    console.error('API error for path:', req.query.path, error.message);
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

// Test endpoint for agent connectivity
app.get('/api/agent/test', async (req, res) => {
  try {
    const { GeminiService } = require('./agent/geminiService');
    const gemini = new GeminiService();
    
    console.log('Testing Gemini connection...');
    const isConnected = await gemini.checkConnection();
    
    if (isConnected) {
      const testResponse = await gemini.generateResponse('Say hello', 'You are a helpful assistant.');
      
      res.json({
        status: 'success',
        gemini: {
          connected: true,
          testResponse: testResponse?.substring(0, 100) + '...',
          model: 'gemini-1.5-pro'
        },
        message: 'Multi-agent system operational'
      });
    } else {
      res.json({
        status: 'warning',
        gemini: {
          connected: false,
          model: 'gemini-1.5-pro'
        },
        message: 'Gemini API not accessible - check API key'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      message: 'Failed to test multi-agent connectivity'
    });
  }
});

// Check Gemini connection status
app.get('/api/agent/status', async (req, res) => {
  try {
    const { GeminiService } = require('./agent/geminiService');
    const gemini = new GeminiService();
    const isConnected = await gemini.checkConnection();
    
    res.json({
      gemini: {
        connected: isConnected,
        model: 'gemini-1.5-pro'
      },
      multiAgent: {
        enabled: true,
        agents: ['planner', 'code-editor', 'reviewer']
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      gemini: { connected: false }
    });
  }
});

// Agent processing endpoint
app.post('/api/agent/process', async (req, res) => {
  try {
    const { message, currentFile } = req.body;
    console.log('Processing multi-agent request:', { message: message?.substring(0, 50), hasFile: !!currentFile });
    
    if (!message || !message.trim()) {
      return res.status(400).json({ 
        error: 'Message is required',
        response: '⚠️ **Error**: Please provide a message for the agents to process.'
      });
    }
    
    const { MultiAgentOrchestrator } = require('./agent/multiAgentOrchestrator');
    const orchestrator = new MultiAgentOrchestrator();
    
    const result = await orchestrator.processRequest(message, { currentFile });
    
    // Handle file edits if any
    if (result.fileEdits && result.fileEdits.length > 0) {
      for (const edit of result.fileEdits) {
        try {
          await orchestrator.editFile(edit.path, edit.content);
          result.response += `\n\n✅ **File Updated**: ${edit.path}`;
        } catch (error) {
          result.response += `\n\n❌ **File Edit Failed**: ${edit.path} - ${error.message}`;
        }
      }
    }
    
    res.json({
      response: result.response,
      success: result.success,
      agentsUsed: result.agentsUsed,
      fileEdits: result.fileEdits || []
    });
  } catch (error) {
    console.error('Multi-agent processing error:', error);
    
    let errorMessage = error.message;
    let suggestion = '';
    
    if (errorMessage.includes('GEMINI_API_KEY')) {
      suggestion = 'Please set your GEMINI_API_KEY environment variable.';
    } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
      suggestion = 'API quota exceeded. Please check your Gemini API usage.';
    } else {
      suggestion = 'Check server logs for more details.';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      suggestion: suggestion,
      response: `❌ **Multi-Agent Error**: ${errorMessage}\n\n💡 **Suggestion**: ${suggestion}`,
      success: false
    });
  }
});





// Execute code endpoint with auto-detection
app.post('/api/execute', async (req, res) => {
  try {
    const { code, language, filename } = req.body;
    
    // Auto-detect language if filename provided
    let execConfig;
    if (filename) {
      execConfig = getExecutionCommand(filename);
      if (!execConfig.canExecute) {
        return res.json({
          success: false,
          output: execConfig.reason
        });
      }
    } else {
      // Fallback to manual language detection
      switch (language) {
        case 'python':
          execConfig = { runner: 'python', args: ['-c'], language: 'python' };
          break;
        case 'javascript':
          execConfig = { runner: 'node', args: ['-e'], language: 'javascript' };
          break;
        default:
          return res.status(400).json({ error: 'Unsupported language or no filename provided' });
      }
    }
    
    let command = execConfig.runner;
    let args;
    
    if (filename && !execConfig.compile) {
      // Direct execution
      args = [...execConfig.args];
      if (!execConfig.args.includes(filename)) {
        args.push(filename);
      }
    } else if (execConfig.compile) {
      // Compilation required
      return res.json({
        success: false,
        output: `${execConfig.language} requires compilation. Use terminal: ${command} ${filename}`
      });
    } else {
      // Code string execution
      args = [...execConfig.args, code];
    }
    
    const child = spawn(command, args, {
      cwd: workspaceRoot,
      timeout: 10000
    });
    
    let output = '';
    let error = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    child.on('close', (code) => {
      res.json({
        success: code === 0,
        output: output || error,
        exitCode: code,
        detectedLanguage: execConfig.language
      });
    });
    
    child.on('error', (err) => {
      res.json({
        success: false,
        output: `Execution error: ${err.message}`,
        exitCode: -1
      });
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Language detection endpoint
app.get('/api/detect-language', (req, res) => {
  const { filename } = req.query;
  if (!filename) {
    return res.status(400).json({ error: 'Filename is required' });
  }
  
  const config = detectLanguage(filename);
  const execConfig = getExecutionCommand(filename);
  
  res.json({
    filename,
    language: config.language,
    canExecute: execConfig.canExecute,
    runner: config.runner,
    needsCompilation: config.compile || false,
    reason: execConfig.reason
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});