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

  async generateWithContext(userQuery) {
    try {
      await this.initialize();
      
      const relevantContext = await this.getRelevantContext(userQuery);
      
      const systemPrompt = `You are a Verilog RTL design expert. Use the provided context to generate accurate, synthesizable Verilog code. Follow RTL design principles strictly.

${relevantContext}

Generate responses based on the context above. If generating Verilog code, ensure it follows the patterns and rules from the context.`;

      const fullPrompt = `${systemPrompt}

User Query: ${userQuery}`;

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

      return {
        response: response.data.response,
        context_used: relevantContext,
        generated: true
      };
    } catch (error) {
      console.error('RAG generation error:', error);
      throw error;
    }
  }
}

module.exports = { RAGService };