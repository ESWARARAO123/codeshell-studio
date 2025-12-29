const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.genAI = null;
    this.model = null;
    this.initializeClient();
  }

  initializeClient() {
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY not found in environment variables');
      return;
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
      console.log('Gemini API initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini API:', error.message);
    }
  }

  async generateResponse(prompt, systemPrompt = '') {
    if (!this.model) {
      throw new Error('Gemini API not initialized. Please check your API key.');
    }

    try {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error.message);
      throw new Error(`Gemini API failed: ${error.message}`);
    }
  }

  async checkConnection() {
    if (!this.apiKey) {
      return false;
    }
    
    try {
      await this.generateResponse('Hello', 'Respond with just "OK"');
      return true;
    } catch (error) {
      console.log('Gemini connection check failed:', error.message);
      return false;
    }
  }
}

module.exports = { GeminiService };