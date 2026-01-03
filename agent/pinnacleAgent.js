// Verilog Code Generation Agent with Ollama Qwen2.5-Coder + RAG

const axios = require('axios');
const { RAGService } = require('../rag/ragService');

class PinnacleAgent {
  constructor() {
    this.name = "Verilog Code Generator";
    this.version = "1.0.0";
    this.ollamaUrl = "http://localhost:11434/api/generate";
    this.model = "qwen2.5-coder:3b";
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
      console.log('Sending request to Ollama:', { model: this.model, prompt: userRequest });
      
      const response = await axios.post(this.ollamaUrl, {
        model: this.model,
        prompt: userRequest,
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9
        }
      }, {
        timeout: 120000
      });
      
      console.log('Ollama response:', response.data);
      
      if (!response.data || !response.data.response) {
        throw new Error('Invalid response from Ollama');
      }
      
      return {
        response: response.data.response,
        generated: true
      };
    } catch (error) {
      console.error('Ollama error:', error);
      if (error.code === 'ECONNREFUSED') {
        return {
          response: `❌ **Connection Error**: Failed to connect to backend 💡 **Please check:** - Backend server is running on port 3010 - Ollama is running with ${this.model} model - Network connection is available`,
          error: error.message
        };
      }
      if (error.response && error.response.status === 404) {
        return {
          response: `❌ **Model Error**: Model '${this.model}' not found. Please ensure the model is installed.`,
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