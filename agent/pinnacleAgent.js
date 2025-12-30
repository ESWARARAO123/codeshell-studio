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
    const systemPrompt = "You are a Verilog code generator. ONLY output raw Verilog module code. NO explanations, NO comments, NO markdown, NO text before or after the code. Start directly with 'module' and end with 'endmodule'. Nothing else.";
    const fullPrompt = `${systemPrompt}\n\nGenerate Verilog code for: ${userRequest}`;
    
    try {
      console.log('Sending request to Ollama:', { model: this.model, prompt: fullPrompt });
      
      const response = await axios.post(this.ollamaUrl, {
        model: this.model,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.0,
          top_p: 0.8,
          stop: ["```", "###", "Explanation", "Usage", "Example"]
        }
      }, {
        timeout: 120000
      });
      
      console.log('Ollama response:', response.data);
      
      if (!response.data || !response.data.response) {
        throw new Error('Invalid response from Ollama');
      }
      
      // Clean the response to remove any unwanted text
      let cleanedResponse = response.data.response.trim();
      
      // Extract only the module code if there's extra text
      const moduleMatch = cleanedResponse.match(/module[\s\S]*?endmodule/i);
      if (moduleMatch) {
        cleanedResponse = moduleMatch[0];
      }
      
      // Remove any markdown formatting
      cleanedResponse = cleanedResponse
        .replace(/```verilog/gi, '')
        .replace(/```/g, '')
        .replace(/^.*?(?=module)/i, '')
        .replace(/(?<=endmodule)[\s\S]*/i, '')
        .trim();
      
      return {
        response: cleanedResponse,
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