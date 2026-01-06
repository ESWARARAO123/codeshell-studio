require('dotenv').config();
const { SimpleVectorDB } = require('./simpleVectorDB_gemini');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class RAGService {
  constructor() {
    this.vectorDB = new SimpleVectorDB();
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
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
      
      if (editorContext.selectedFile) {
        contextInfo += `\n\nSELECTED FILE FOR INTEGRATION: ${editorContext.selectedFile}\n`;
      }
      
      const systemPrompt = `You are a Verilog RTL design expert and file management assistant. Use the provided context to generate accurate, synthesizable Verilog code. Follow RTL design principles strictly.

${relevantContext}${contextInfo}

Generate responses based on the context above. If generating Verilog code, ensure it follows the patterns and rules from the context.

IMPORTANT: When the user asks to generate, create, write, or modify Verilog code and there is a currently active file, you MUST respond with a JSON object in this format:
{
  "action": "modify_active_file",
  "filename": "current_filename",
  "content": "complete modified file content",
  "message": "Brief explanation of changes made"
}

If the user mentions a specific file with @ symbol and asks for code related to that file, respond with:
{
  "action": "integrate_code",
  "targetFile": "selected_file_path",
  "code": "generated code here",
  "message": "explanation of the code"
}

If the user asks to modify other open files, respond with:
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

For regular responses without file operations, just provide the text response.`;

      const fullPrompt = `${systemPrompt}\n\nUser Query: ${userQuery}`;

      const result = await this.model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          topP: 0.9,
          maxOutputTokens: 2048
        }
      });

      const response = await result.response;
      const responseText = response.text();

      const resultObj = {
        response: responseText,
        context_used: relevantContext,
        generated: true
      };

      // Check if response contains file action
      if (this.isFileActionResponse(responseText)) {
        resultObj.fileAction = this.parseFileAction(responseText);
      }

      return resultObj;
    } catch (error) {
      console.error('RAG generation error:', error);
      throw error;
    }
  }

  detectFileAction(query) {
    const fileKeywords = ['create file', 'save to file', 'write to file', 'generate file', 'save as', 'create', 'write', 'modify', 'change', 'update', 'add', 'fix', 'edit', 'generate', 'make', 'build'];
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