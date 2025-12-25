// Code Review Agent - Analyzes code for issues, best practices, and improvements using CodeLlama

const { OllamaService } = require('./ollamaService');

class CodeReviewAgent {
  constructor() {
    this.name = "Code Review Agent";
    this.specialization = "code-review";
    this.ollama = new OllamaService();
  }

  async reviewCode(code, filePath, language, userMessage = "") {
    const systemPrompt = `You are a code reviewer for ${language}. Provide concise feedback on:
1. Bugs and issues
2. Best practices
3. Improvements

Keep responses under 300 words.`;

    const reviewPrompt = `Review this ${language} code:

\`\`\`${language}
${code.substring(0, 1000)}${code.length > 1000 ? '\n// ... (truncated)' : ''}
\`\`\`

${userMessage ? `Focus: ${userMessage}` : ''}

Provide specific, actionable feedback.`;

    try {
      const response = await this.ollama.generateResponse(reviewPrompt, systemPrompt);
      
      return {
        agent: this.name,
        analysis: {
          summary: response,
          filePath,
          language,
          userMessage
        },
        rawResponse: response
      };
    } catch (error) {
      return {
        agent: this.name,
        analysis: {
          summary: `Code review analysis failed: ${error.message}`,
          filePath,
          language,
          userMessage
        },
        error: error.message
      };
    }
  }
}

module.exports = { CodeReviewAgent };