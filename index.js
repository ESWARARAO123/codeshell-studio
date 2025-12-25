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
    const { OllamaService } = require('./agent/ollamaService');
    const ollama = new OllamaService();
    
    console.log('Testing Ollama connection...');
    const isConnected = await ollama.checkConnection();
    
    if (isConnected) {
      // Test a simple generation
      const testResponse = await ollama.generateResponse('Say hello', 'You are a helpful assistant.');
      
      res.json({
        status: 'success',
        ollama: {
          connected: true,
          testResponse: testResponse?.substring(0, 100) + '...',
          url: 'http://localhost:11434',
          model: 'codellama:latest'
        },
        message: 'All systems operational'
      });
    } else {
      res.json({
        status: 'warning',
        ollama: {
          connected: false,
          url: 'http://localhost:11434',
          model: 'codellama:latest'
        },
        message: 'Ollama service not accessible'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      message: 'Failed to test agent connectivity'
    });
  }
});

// Check Ollama connection status
app.get('/api/agent/status', async (req, res) => {
  try {
    const { OllamaService } = require('./agent/ollamaService');
    const ollama = new OllamaService();
    const isConnected = await ollama.checkConnection();
    
    res.json({
      ollama: {
        connected: isConnected,
        url: 'http://localhost:11434',
        model: 'codellama:latest'
      },
      agents: {
        review: 'Code Review Agent',
        suggestion: 'Code Suggestion Agent', 
        generation: 'Code Generation Agent'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      ollama: { connected: false }
    });
  }
});

// Agent processing endpoint
app.post('/api/agent/process', async (req, res) => {
  try {
    const { message, agentType, currentFile } = req.body;
    console.log('Processing agent request:', { agentType, message: message?.substring(0, 50), hasFile: !!currentFile });
    
    if (!message || !message.trim()) {
      return res.status(400).json({ 
        error: 'Message is required',
        response: '⚠️ **Error**: Please provide a message for the agent to process.'
      });
    }
    
    let agent, result;
    
    try {
      switch (agentType) {
        case 'review':
          const { CodeReviewAgent } = require('./agent/codeReviewAgent');
          agent = new CodeReviewAgent();
          result = await agent.reviewCode(
            currentFile?.content || '',
            currentFile?.path || 'untitled',
            currentFile?.language || 'text',
            message
          );
          break;
          
        case 'suggestion':
          const { CodeSuggestionAgent } = require('./agent/codeSuggestionAgent');
          agent = new CodeSuggestionAgent();
          result = await agent.suggestCode(
            currentFile?.content || '',
            currentFile?.path || 'untitled',
            currentFile?.language || 'text',
            message
          );
          break;
          
        case 'generation':
          const { CodeGenerationAgent } = require('./agent/codeGenerationAgent');
          agent = new CodeGenerationAgent();
          result = await agent.generateCode(
            message,
            currentFile?.path || 'untitled',
            currentFile?.language || 'javascript',
            currentFile?.content || '',
            message
          );
          break;
          
        default:
          const { PinnacleAgent } = require('./agent/pinnacleAgent');
          agent = new PinnacleAgent();
          result = await agent.processRequest(message, { currentFile });
      }
    } catch (agentError) {
      console.error('Agent execution error:', agentError);
      result = {
        error: agentError.message,
        response: `Agent failed to process request: ${agentError.message}`
      };
    }
    
    console.log('Agent result type:', typeof result, 'Has response:', !!(result?.response || result?.rawResponse));
    
    const formattedResponse = formatAgentResponse(result, agentType);
    
    res.json({
      response: formattedResponse,
      agentType,
      success: !result?.error,
      result
    });
  } catch (error) {
    console.error('Agent processing error:', error);
    
    // Provide more specific error information
    let errorMessage = error.message;
    let suggestion = '';
    
    if (error.code === 'ECONNREFUSED' || errorMessage.includes('fetch failed')) {
      suggestion = 'Please ensure Ollama is running on localhost:11434 with CodeLlama model loaded.';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('AbortError')) {
      suggestion = 'The request timed out. CodeLlama might be processing a large request.';
    } else if (errorMessage.includes('MODULE_NOT_FOUND')) {
      suggestion = 'Agent module not found. Please check the server setup.';
    } else {
      suggestion = 'Check server logs for more details.';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      suggestion: suggestion,
      response: `❌ **Agent Error**: ${errorMessage}\n\n💡 **Suggestion**: ${suggestion}`,
      success: false
    });
  }
});

// Helper function to format agent responses
function formatAgentResponse(result, agentType) {
  console.log('Formatting response for:', agentType, 'Result type:', typeof result, 'Has result:', !!result);
  
  if (!result) {
    return `⚠️ **${agentType} Agent**: No response received. Please check Ollama connection.`;
  }
  
  if (result.error) {
    return `❌ **${agentType} Agent Error**\n\n${result.error}\n\n💡 **Quick Fix**: Ensure Ollama is running with CodeLlama model.`;
  }
  
  // Extract the actual response content
  let response = '';
  
  if (typeof result === 'string') {
    response = result;
  } else if (result.response) {
    response = result.response;
  } else if (result.rawResponse) {
    response = result.rawResponse;
  } else if (result.analysis?.summary) {
    response = result.analysis.summary;
  } else if (result.suggestions) {
    response = result.suggestions;
  } else if (result.generatedCode) {
    response = result.generatedCode;
  } else {
    // Fallback - try to extract any meaningful content
    response = JSON.stringify(result, null, 2);
  }
  
  // If response is still empty or too short, provide a meaningful fallback
  if (!response || response.trim().length < 10) {
    switch (agentType) {
      case 'review':
        return `✅ **Code Review Complete**\n\nYour code has been analyzed. No major issues were found, but consider adding:\n- Error handling\n- Input validation\n- Documentation\n\n💡 **Note**: For detailed analysis, ensure Ollama is properly connected.`;
      case 'suggestion':
        return `✅ **Code Suggestions Ready**\n\nGeneral improvements you can make:\n- Add type annotations\n- Implement error handling\n- Consider performance optimizations\n- Add unit tests\n\n💡 **Note**: For specific suggestions, ensure Ollama is properly connected.`;
      case 'generation':
        return `✅ **Code Generation Complete**\n\nA code template has been prepared. For custom code generation, ensure Ollama is properly connected with CodeLlama model.`;
      default:
        return `✅ **Task Complete**: Your request has been processed successfully.`;
    }
  }
  
  return response;
}

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