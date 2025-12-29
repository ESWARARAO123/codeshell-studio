const { GeminiService } = require('./geminiService');
const { AGENT_PROMPTS } = require('./agentPrompts');
const fs = require('fs').promises;
const path = require('path');

class MultiAgentOrchestrator {
  constructor() {
    this.gemini = new GeminiService();
    this.workspaceRoot = process.cwd();
  }

  async processRequest(message, context = {}) {
    try {
      const requestType = this.analyzeRequest(message);
      
      // Route to appropriate agent based on request type
      switch (requestType) {
        case 'code_generation':
          return await this.codeEditorAgent(message, context);
        case 'code_review':
          return await this.reviewerAgent(message, context);
        case 'planning':
          return await this.plannerAgent(message, context);
        case 'complex':
          // Use all three agents for complex requests
          return await this.processComplexRequest(message, context);
        default:
          return await this.codeEditorAgent(message, context);
      }
    } catch (error) {
      console.error('Multi-agent orchestration error:', error);
      return {
        response: `Error: ${error.message}`,
        success: false
      };
    }
  }

  analyzeRequest(message) {
    const lowerMessage = message.toLowerCase();
    
    // Simple code generation requests
    if (lowerMessage.includes('give') && (lowerMessage.includes('code') || lowerMessage.includes('python') || lowerMessage.includes('javascript'))) {
      return 'code_generation';
    }
    
    // Review requests
    if (lowerMessage.includes('review') || lowerMessage.includes('analyze') || lowerMessage.includes('check')) {
      return 'code_review';
    }
    
    // Planning requests
    if (lowerMessage.includes('plan') || lowerMessage.includes('strategy') || lowerMessage.includes('approach')) {
      return 'planning';
    }
    
    // Complex requests that need multiple agents
    if (lowerMessage.includes('refactor') || lowerMessage.includes('improve and edit') || lowerMessage.includes('fix and update')) {
      return 'complex';
    }
    
    return 'code_generation';
  }

  async processComplexRequest(message, context) {
    // Step 1: Planner Agent - Analyze request and create plan
    const plan = await this.plannerAgent(message, context);
    
    // Step 2: Code Editor Agent - Execute the plan
    const codeResult = await this.codeEditorAgent(message, context, plan);
    
    // Step 3: Reviewer Agent - Validate the changes
    const reviewResult = await this.reviewerAgent(codeResult, plan);
    
    // Combine results
    return this.combineResults(plan, codeResult, reviewResult);
  }

  async plannerAgent(message, context) {
    const { currentFile } = context;
    
    const prompt = `User Request: ${message}

${currentFile ? `Current File Context:
File: ${currentFile.path}
Language: ${currentFile.language}
Content:
\`\`\`${currentFile.language}
${currentFile.content}
\`\`\`

` : ''}Analyze this request and create a plan.`;

    const response = await this.gemini.generateResponse(prompt, AGENT_PROMPTS.PLANNER);
    const planData = JSON.parse(response);
    
    return {
      response: `Task: ${planData.task_type}\nRisk Level: ${planData.risk_level}\nPlan:\n${planData.plan.map((step, i) => `${i + 1}. ${step}`).join('\n')}`,
      success: true,
      agentsUsed: ['planner'],
      fileEdits: []
    };
  }

  async codeEditorAgent(message, context, plan = null) {
    const { currentFile } = context;
    
    const prompt = `User Request: ${message}\n\n${plan ? `Plan from Planner Agent:\n${JSON.stringify(plan, null, 2)}\n\n` : ''}${currentFile ? `Current File to Edit:\nFile: ${currentFile.path}\nLanguage: ${currentFile.language}\nContent:\n\`\`\`${currentFile.language}\n${currentFile.content}\n\`\`\`\n\n` : ''}Execute the plan and provide the code changes.`;

    const response = await this.gemini.generateResponse(prompt, AGENT_PROMPTS.CODE_EDITOR);
    
    // Extract file edits from response
    const fileEdits = this.extractFileEdits(response, currentFile);
    
    return {
      response,
      fileEdits,
      success: true,
      agentsUsed: ['code-editor']
    };
  }

  async reviewerAgent(message, context) {
    const { currentFile } = context;
    
    const prompt = `Review this code and provide feedback:

${currentFile ? `File: ${currentFile.path}
Language: ${currentFile.language}
Code:
\`\`\`${currentFile.language}
${currentFile.content}
\`\`\`

` : ''}User request: ${message}

Validate the code for safety and correctness.`;

    const response = await this.gemini.generateResponse(prompt, AGENT_PROMPTS.REVIEWER);
    const reviewData = JSON.parse(response);
    
    return {
      response: `Status: ${reviewData.approved ? '✅ APPROVED' : '❌ REJECTED'}\n${reviewData.notes || ''}`,
      success: true,
      agentsUsed: ['reviewer'],
      fileEdits: []
    };
  }

  extractFileEdits(response, currentFile) {
    const fileEdits = [];
    
    // Look for code blocks or file content in the response
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
    const matches = response.match(codeBlockRegex);
    
    if (matches && currentFile) {
      // Extract the largest code block as the new file content
      let longestMatch = '';
      matches.forEach(match => {
        const content = match.replace(/```[\w]*\n/, '').replace(/```$/, '');
        if (content.length > longestMatch.length) {
          longestMatch = content;
        }
      });
      
      if (longestMatch.trim()) {
        fileEdits.push({
          path: currentFile.path,
          content: longestMatch.trim(),
          reason: "Code editor agent modification"
        });
      }
    }
    
    return fileEdits;
  }

  combineResults(plan, codeResult, reviewResult) {
    let response = `🎯 **PLANNER AGENT**\nTask: ${plan.task_type}\nRisk Level: ${plan.risk_level}\n\n`;
    
    response += `✏️ **CODE EDITOR AGENT**\n${codeResult.response}\n\n`;
    
    response += `🛡️ **REVIEWER AGENT**\n`;
    response += `Status: ${reviewResult.approved ? '✅ APPROVED' : '❌ REJECTED'}\n`;
    
    if (reviewResult.issues && reviewResult.issues.length > 0) {
      response += `Issues Found:\n`;
      reviewResult.issues.forEach(issue => {
        response += `- ${issue.type}: ${issue.description}\n`;
      });
    }
    
    if (reviewResult.notes) {
      response += `Notes: ${reviewResult.notes}\n`;
    }

    return {
      response: response.trim(),
      success: reviewResult.approved,
      fileEdits: reviewResult.approved ? codeResult.fileEdits : [],
      agentsUsed: ['planner', 'code-editor', 'reviewer'],
      plan,
      reviewResult
    };
  }

  async editFile(filePath, content) {
    try {
      await fs.writeFile(filePath, content, 'utf8');
      return { success: true, message: `File ${filePath} updated successfully` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = { MultiAgentOrchestrator };