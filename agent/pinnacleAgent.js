require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { RAGService } = require('../rag/ragService');

class PinnacleAgent {
  constructor() {
    this.name = "Verilog Code Generator";
    this.version = "1.0.0";
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    this.ragService = new RAGService();
    this.ragReady = false;
    this.initializeRAG();
  }

  async initializeRAG() {
    try {
      console.log('🚀 Initializing RAG system...');
      await this.ragService.initialize();
      await this.ragService.indexContext();
      this.ragReady = true;
      console.log('✅ RAG system ready!');
    } catch (error) {
      console.log('⚠️  RAG initialization failed, using fallback mode:', error.message);
      this.ragReady = false;
    }
  }

  async processRequest(message, context = {}) {
    // Log the context to debug
    console.log('📋 Context received:', {
      hasOpenFiles: !!(context.openFiles && context.openFiles.length > 0),
      openFilesCount: context.openFiles ? context.openFiles.length : 0,
      hasActiveFile: !!context.activeFile,
      activeFileName: context.activeFile ? context.activeFile.filename : 'none',
      activeFileContentLength: context.activeFile ? context.activeFile.content.length : 0
    });
    
    // Use RAG if ready, otherwise fallback to basic generation
    if (this.ragReady) {
      try {
        console.log('🎯 Using RAG for query:', message.substring(0, 50) + '...');
        return await this.ragService.generateWithContext(message, context);
      } catch (error) {
        console.log('⚠️  RAG failed, using fallback:', error.message);
        return await this.generateResponse(message, context);
      }
    } else {
      console.log('🔧 Using basic generation (RAG not ready)');
      return await this.generateResponse(message, context);
    }
  }

  async generateResponse(userRequest, context = {}) {
    try {
      // Build context for fallback mode
      let contextPrompt = userRequest;
      if (context.activeFile) {
        contextPrompt = `ACTIVE FILE: ${context.activeFile.filename}\n\nFILE CONTENT:\n${context.activeFile.content}\n\nUSER QUERY: ${userRequest}`;
      }
      
      console.log('Sending request to Gemini:', { prompt: contextPrompt.substring(0, 100) + '...' });
      
      const result = await this.model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: contextPrompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          topP: 0.9,
          maxOutputTokens: 2048
        }
      });
      
      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini response received:', text.substring(0, 100) + '...');
      
      if (!text) {
        throw new Error('Empty response from Gemini');
      }
      
      return {
        response: text,
        generated: true
      };
    } catch (error) {
      console.error('Gemini error:', error);
      if (error.message.includes('API_KEY')) {
        return {
          response: `❌ **API Key Error**: Invalid or missing Gemini API key. Please check your GEMINI_API_KEY environment variable.`,
          error: error.message
        };
      }
      if (error.message.includes('quota')) {
        return {
          response: `❌ **Quota Error**: Gemini API quota exceeded. Please check your usage limits.`,
          error: error.message
        };
      }
      return {
        response: `❌ **Error**: ${error.message}`,
        error: error.message
      };
    }
  }
}

module.exports = { PinnacleAgent };