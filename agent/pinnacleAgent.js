// Verilog Code Generation Agent with Ollama Qwen2.5-Coder

const axios = require('axios');

class PinnacleAgent {
  constructor() {
    this.name = "Verilog Code Generator";
    this.version = "1.0.0";
    this.ollamaUrl = "http://localhost:11434/api/generate";
    this.model = "qwen2.5-coder:3b";
  }

  async processRequest(message, context = {}) {
    return await this.generateResponse(message, context);
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
          response: `❌ **Connection Error**: Failed to connect to backend 💡 **Please check:** - Backend server is running on port 3001 - Ollama is running with ${this.model} model - Network connection is available`,
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