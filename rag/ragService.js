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
      
      console.log('📋 RAG Context received:', {
        hasOpenFiles: !!(editorContext.openFiles && editorContext.openFiles.length > 0),
        openFilesCount: editorContext.openFiles ? editorContext.openFiles.length : 0,
        hasActiveFile: !!editorContext.activeFile,
        activeFileName: editorContext.activeFile ? editorContext.activeFile.filename : 'none'
      });
      
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
        console.log(`✅ Added ${editorContext.openFiles.length} open files to context`);
      }
      
      if (editorContext.activeFile) {
        contextInfo += `\n\nCURRENTLY ACTIVE FILE: ${editorContext.activeFile.filename}\n`;
        contextInfo += `FILE CONTENT:\n${editorContext.activeFile.content}\n`;
        console.log(`✅ Added active file ${editorContext.activeFile.filename} to context (${editorContext.activeFile.content.length} chars)`);
      }
      
      if (editorContext.selectedFile) {
        contextInfo += `\n\nSELECTED FILE FOR INTEGRATION: ${editorContext.selectedFile}\n`;
      }
      
      // Handle @file references in the query
      const fileReferences = this.extractFileReferences(userQuery);
      console.log('Extracted file references:', fileReferences);
      if (fileReferences.length > 0) {
        contextInfo += '\n\nREFERENCED FILES:\n';
        for (const fileName of fileReferences) {
          try {
            console.log(`Attempting to read file: ${fileName}`);
            const fileContent = await this.readReferencedFile(fileName, editorContext);
            console.log(`Successfully read file ${fileName}, content length: ${fileContent.length}`);
            contextInfo += `\n--- @${fileName} ---\n${fileContent}\n`;
          } catch (error) {
            console.log(`Failed to read file ${fileName}:`, error.message);
            contextInfo += `\n--- @${fileName} ---\nError: Could not read file ${fileName}\n`;
          }
        }
      }
      
      const systemPrompt = `You are a Verilog RTL design expert with FULL ACCESS to the user's current workspace and open files.

${relevantContext}${contextInfo}

IMPORTANT - YOU HAVE DIRECT ACCESS TO:
- All open files in the editor (shown above in OPEN FILES section)
- The currently active file being edited (shown above in CURRENTLY ACTIVE FILE section)
- Any files referenced with @filename (shown above in REFERENCED FILES section)

CRITICAL INSTRUCTIONS:
- You can READ and analyze ALL file content shown above
- NEVER ask users to "paste code" or "provide file content" - you already have it
- When users ask about "this file" or "current file", refer to the CURRENTLY ACTIVE FILE
- Provide specific analysis, suggestions, and improvements based on the actual code you can see
- If you see issues in the code, point them out specifically with line references

When the user asks to modify the current/active file, respond with JSON:
{
  "action": "modify_active_file",
  "filename": "current_filename",
  "content": "complete modified file content",
  "message": "Brief explanation of changes made"
}

For analysis and suggestions, provide detailed responses based on the file content you have access to.`;

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

  extractFileReferences(query) {
    const fileRegex = /@([\w\.-]+)/g;
    const matches = [];
    let match;
    while ((match = fileRegex.exec(query)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }

  async readReferencedFile(fileName, editorContext) {
    const fs = require('fs').promises;
    const path = require('path');
    
    console.log(`Reading file: ${fileName}`);
    console.log(`Current working directory: ${process.cwd()}`);
    
    // First check if file is already open in editor
    if (editorContext.openFiles) {
      console.log(`Checking ${editorContext.openFiles.length} open files`);
      const openFile = editorContext.openFiles.find(file => 
        file.filename === fileName || file.filepath.endsWith(fileName)
      );
      if (openFile) {
        console.log(`Found file in open files: ${openFile.filename}`);
        return openFile.content;
      }
    }
    
    // Try to read from current working directory
    const currentDir = process.cwd();
    const filePath = path.join(currentDir, fileName);
    console.log(`Trying to read from: ${filePath}`);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      console.log(`Successfully read file from: ${filePath}`);
      return content;
    } catch (error) {
      console.log(`Failed to read ${filePath}: ${error.message}`);
      // Try common file extensions if not found
      const extensions = ['.v', '.sv', '.vhd', '.vhdl', '.txt', '.md'];
      for (const ext of extensions) {
        try {
          const extPath = path.join(currentDir, fileName + ext);
          console.log(`Trying with extension: ${extPath}`);
          const content = await fs.readFile(extPath, 'utf-8');
          console.log(`Successfully read file from: ${extPath}`);
          return content;
        } catch (e) {
          console.log(`Failed to read ${extPath}: ${e.message}`);
          continue;
        }
      }
      throw new Error(`File ${fileName} not found in ${currentDir}`);
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