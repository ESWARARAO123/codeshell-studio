// Test script to verify agent functionality
const { OllamaService } = require('./agent/ollamaService');
const { PinnacleAgent } = require('./agent/pinnacleAgent');
const { CodeReviewAgent } = require('./agent/codeReviewAgent');

async function testAgents() {
  console.log('🧪 Testing Agent System...\n');
  
  // Test 1: Ollama Connection
  console.log('1. Testing Ollama Connection...');
  try {
    const ollama = new OllamaService();
    const isConnected = await ollama.checkConnection();
    console.log(`   ✅ Ollama Connected: ${isConnected}`);
    
    if (isConnected) {
      const testResponse = await ollama.generateResponse('Hello', 'You are a helpful assistant.');
      console.log(`   ✅ Test Response: ${testResponse.substring(0, 50)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Ollama Error: ${error.message}`);
  }
  
  // Test 2: Pinnacle Agent
  console.log('\n2. Testing Pinnacle Agent...');
  try {
    const pinnacle = new PinnacleAgent();
    const result = await pinnacle.processRequest('Hello, can you help me?');
    console.log(`   ✅ Pinnacle Response: ${result.response.substring(0, 50)}...`);
  } catch (error) {
    console.log(`   ❌ Pinnacle Error: ${error.message}`);
  }
  
  // Test 3: Code Review Agent
  console.log('\n3. Testing Code Review Agent...');
  try {
    const reviewer = new CodeReviewAgent();
    const result = await reviewer.reviewCode(
      'function hello() { console.log("hello"); }',
      'test.js',
      'javascript',
      'Review this function'
    );
    console.log(`   ✅ Review Response: ${result.analysis.summary.substring(0, 50)}...`);
  } catch (error) {
    console.log(`   ❌ Review Error: ${error.message}`);
  }
  
  console.log('\n🎉 Agent testing complete!');
}

// Run tests
testAgents().catch(console.error);