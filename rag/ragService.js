const { SimpleVectorDB } = require('./simpleVectorDB');
const axios = require('axios');

class RAGService {
  constructor() {
    this.vectorDB = new SimpleVectorDB();
    this.ollamaUrl = 'http://localhost:11434/api/generate';
    this.model = 'qwen2.5-coder:3b';
    this.initialized = false;
  }

  async initialize() {
    // Simple vector DB doesn't need initialization
    this.initialized = true;
  }

  async indexContext() {
    const contextFile = 'c:\\Users\\Administrator\\Desktop\\eswar\\trial1\\codeshell-studio\\rag\\RTL_Verilog_LLM_Context_v2.md';
    await this.vectorDB.processMarkdownFile(contextFile);
    console.log('Context indexed successfully');
  }

  async getRelevantContext(query, maxResults = 3) {
    const results = await this.vectorDB.search(query, maxResults);
    
    if (!results.documents || results.documents.length === 0) {
      return '';
    }

    let context = 'RELEVANT CONTEXT:\\n\\n';
    results.documents[0].forEach((doc, index) => {
      const metadata = results.metadatas[0][index];
      context += `## ${metadata.section}\\n${doc}\\n\\n`;
    });
    
    return context;
  }

  async generateWithContext(userQuery, editorContext = {}) {
    try {
      await this.initialize();
      
      const relevantContext = await this.getRelevantContext(userQuery);
      
      // Check if user wants file operations
      const fileAction = this.detectFileAction(userQuery);
      
      // Build context with open files
      let contextInfo = '';
      if (editorContext.openFiles && editorContext.openFiles.length > 0) {
        contextInfo += '\n\nOPEN FILES IN EDITOR:\n';
        editorContext.openFiles.forEach(file => {
          contextInfo += `\n--- ${file.filename} ---\n${file.content}\n`;
        });
      }
      
      if (editorContext.activeFile) {
        contextInfo += `\n\nCURRENTLY ACTIVE FILE: ${editorContext.activeFile.filename}\n`;
      }
      
      const systemPrompt = `You are a Verilog RTL design expert and file management assistant. Use the provided context to generate accurate, synthesizable Verilog code. Follow RTL design principles strictly.

${relevantContext}${contextInfo}

Generate responses based on the context above. If generating Verilog code, ensure it follows the patterns and rules from the context.

If the user asks to modify existing open files, respond with a JSON object in this format:
{
  "action": "modify_open_files",
  "modifications": [
    {
      "filepath": "path/to/file",
      "content": "new file content"
    }
  ],
  "message": "explanation message"
}

If the user asks to create new files, respond with:
{
  "action": "create_file",
  "filename": "filename.v",
  "content": "file content here",
  "message": "explanation message"
}

For regular responses, just provide the text response.`;

      const fullPrompt = `${systemPrompt}\n\nUser Query: ${userQuery}`;

      const response = await axios.post(this.ollamaUrl, {
        model: this.model,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9
        }
      }, {
        timeout: 120000
      });

      const result = {
        response: response.data.response,
        context_used: relevantContext,
        generated: true
      };

      // Check if response contains file action
      if (fileAction && this.isFileActionResponse(response.data.response)) {
        result.fileAction = this.parseFileAction(response.data.response);
      }

      return result;
    } catch (error) {
      console.error('RAG generation error:', error);
      throw error;
    }
  }

  detectFileAction(query) {
    const fileKeywords = ['create file', 'save to file', 'write to file', 'generate file', 'save as', 'create', 'write'];
    const lowerQuery = query.toLowerCase();
    return fileKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  isFileActionResponse(response) {
    try {
      const parsed = JSON.parse(response);
      return parsed.action && parsed.filename && parsed.content;
    } catch {
      return false;
    }
  }

  parseFileAction(response) {
    try {
      return JSON.parse(response);
    } catch {
      return null;
    }
  }
}

module.exports = { RAGService };