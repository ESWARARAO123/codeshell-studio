// Pinnacle Agent - AI Assistant for code generation and help using CodeLlama

const { OllamaService } = require('./ollamaService');

class PinnacleAgent {
  constructor() {
    this.name = "Pinnacle Agent";
    this.version = "1.0.0";
    this.ollama = new OllamaService();
  }

  async processRequest(message, context = {}) {
    const systemPrompt = `You are Pinnacle Agent, an AI coding assistant powered by CodeLlama. You help developers with:
1. Code analysis and debugging
2. Code generation and completion
3. Best practices and optimization
4. Technical explanations and guidance
5. Problem-solving and troubleshooting

Provide helpful, accurate, and practical assistance for coding tasks.`;

    const requestPrompt = `User Request: ${message}

${context.currentFile ? `Current File Context:
File: ${context.currentFile.path}
Language: ${context.currentFile.language}
Content: ${context.currentFile.content}` : ''}

Please provide helpful assistance based on the user's request.`;

    try {
      const response = await this.ollama.generateResponse(requestPrompt, systemPrompt);
      
      return {
        response: response,
        suggestions: [
          "Generate a React component",
          "Explain this code",
          "Fix bugs in my code",
          "Optimize performance"
        ]
      };
    } catch (error) {
      return {
        response: `Hello! I'm ${this.name}. I'm currently having trouble connecting to CodeLlama. Please ensure Ollama is running with the CodeLlama model. How can I help you with your code today?`,
        suggestions: [
          "Generate a React component",
          "Explain this code", 
          "Fix bugs in my code",
          "Optimize performance"
        ],
        error: error.message
      };
    }
  }

  async generateCode(prompt, language = 'javascript') {
    const systemPrompt = `Generate clean, working ${language} code based on the user's requirements. Follow best practices and include proper error handling.`;
    
    try {
      const response = await this.ollama.generateResponse(prompt, systemPrompt);
      
      return {
        code: response,
        explanation: `Generated ${language} code based on your request.`
      };
    } catch (error) {
      return {
        code: `// Code generation failed: ${error.message}\n// Please ensure Ollama is running with CodeLlama model`,
        explanation: `Failed to generate code: ${error.message}`
      };
    }
  }

  async explainCode(code) {
    const systemPrompt = `Explain the provided code in clear, simple terms. Break down what it does, how it works, and any important concepts.`;
    
    try {
      const response = await this.ollama.generateResponse(`Explain this code:\n\n${code}`, systemPrompt);
      
      return {
        explanation: response,
        suggestions: ["Consider adding error handling", "Add type annotations"]
      };
    } catch (error) {
      return {
        explanation: "Code explanation failed. Please ensure Ollama is running with CodeLlama model.",
        suggestions: ["Check Ollama connection", "Verify CodeLlama model"]
      };
    }
  }
}

module.exports = { PinnacleAgent };