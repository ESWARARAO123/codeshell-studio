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
    const systemPrompt = "OUTPUT ONLY VERILOG CODE. NO TEXT. NO EXPLANATIONS. NO MARKDOWN. START WITH 'module' END WITH 'endmodule'. NOTHING ELSE.";
    const fullPrompt = `${systemPrompt}\n\n${userRequest}`;
    
    try {
      console.log('Sending request to Ollama:', { model: this.model, prompt: fullPrompt });
      
      const response = await axios.post(this.ollamaUrl, {
        model: this.model,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.0,
          top_p: 0.5,
          stop: ["```", "###", "Explanation", "Usage", "Example", "How it", "This", "The", "In this", "Below is"]
        }
      }, {
        timeout: 120000
      });
      
      console.log('Ollama response:', response.data);
      
      if (!response.data || !response.data.response) {
        throw new Error('Invalid response from Ollama');
      }
      
      // Aggressive cleaning of the response
      let cleanedResponse = response.data.response.trim();
      
      // Remove everything before the first 'module'
      const moduleStart = cleanedResponse.toLowerCase().indexOf('module');
      if (moduleStart !== -1) {
        cleanedResponse = cleanedResponse.substring(moduleStart);
      }
      
      // Find the last 'endmodule' and cut everything after it
      const endmoduleEnd = cleanedResponse.toLowerCase().lastIndexOf('endmodule') + 9;
      if (endmoduleEnd > 8) {
        cleanedResponse = cleanedResponse.substring(0, endmoduleEnd);
      }
      
      // Remove markdown and common explanation starters
      cleanedResponse = cleanedResponse
        .replace(/```verilog/gi, '')
        .replace(/```/g, '')
        .replace(/^.*?(?=module)/i, '')
        .replace(/(?<=endmodule)[\s\S]*/i, '')
        .replace(/^(Certainly!|Below is|Here is|This is|The following)[\s\S]*?(?=module)/gi, '')
        .replace(/### [\s\S]*$/gi, '')
        .replace(/\*\*[^*]*\*\*/g, '')
        .trim();
      
      // If still no module found, return error
      if (!cleanedResponse.toLowerCase().includes('module')) {
        return {
          response: "Error: Could not generate valid Verilog code. Please try rephrasing your request.",
          error: "No module found in response"
        };
      }
      
      return {
        response: cleanedResponse,
        generated: true,
        language: 'verilog'
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