// Code Suggestion Agent - Provides intelligent code completions and improvements using CodeLlama

const { OllamaService } = require('./ollamaService');

class CodeSuggestionAgent {
  constructor() {
    this.name = "Code Suggestion Agent";
    this.specialization = "code-suggestions";
    this.ollama = new OllamaService();
  }

  async suggestCode(code, filePath, language, userMessage = "", cursorPosition = 0) {
    const systemPrompt = `You are a ${language} code assistant. Provide concise suggestions and improvements. Keep responses under 200 words.`;

    const suggestionPrompt = `Improve this ${language} code:

\`\`\`${language}
${code.substring(0, 800)}${code.length > 800 ? '\n// ... (truncated)' : ''}
\`\`\`

${userMessage ? `Request: ${userMessage}` : ''}

Provide specific improvements.`;

    try {
      const response = await this.ollama.generateResponse(suggestionPrompt, systemPrompt);
      
      return {
        agent: this.name,
        suggestions: response,
        context: this.analyzeContext(code, cursorPosition),
        filePath,
        language,
        userMessage,
        rawResponse: response
      };
    } catch (error) {
      return {
        agent: this.name,
        suggestions: `Code suggestion failed: ${error.message}`,
        context: this.analyzeContext(code, cursorPosition),
        filePath,
        language,
        userMessage,
        error: error.message
      };
    }
  }

  analyzeContext(code, cursorPosition) {
    const lines = code.split('\n');
    const currentLineIndex = this.getCurrentLine(code, cursorPosition);
    const currentLine = lines[currentLineIndex] || '';
    
    return {
      currentLine,
      currentLineIndex,
      previousLines: lines.slice(Math.max(0, currentLineIndex - 3), currentLineIndex),
      nextLines: lines.slice(currentLineIndex + 1, currentLineIndex + 4),
      isInFunction: this.isInFunction(lines, currentLineIndex),
      isInClass: this.isInClass(lines, currentLineIndex),
      totalLines: lines.length
    };
  }

  getCurrentLine(code, cursorPosition) {
    const beforeCursor = code.substring(0, cursorPosition);
    return beforeCursor.split('\n').length - 1;
  }

  isInFunction(lines, currentLineIndex) {
    for (let i = currentLineIndex; i >= 0; i--) {
      if (lines[i].includes('function ') || lines[i].includes('=> {') || lines[i].includes('def ')) {
        return true;
      }
    }
    return false;
  }

  isInClass(lines, currentLineIndex) {
    for (let i = currentLineIndex; i >= 0; i--) {
      if (lines[i].includes('class ')) {
        return true;
      }
    }
    return false;
  }
}

module.exports = { CodeSuggestionAgent };