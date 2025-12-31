const { RAGService } = require('./ragService');

async function testRAG() {
  console.log('🧪 Testing RAG System...');
  
  try {
    const ragService = new RAGService();
    
    // Initialize
    console.log('📊 Initializing RAG service...');
    await ragService.initialize();
    console.log('✅ RAG service initialized');
    
    // Index context
    console.log('📝 Indexing context file...');
    await ragService.indexContext();
    console.log('✅ Context indexed');
    
    // Test a simple query
    console.log('🔍 Testing query: "Generate a full adder"');
    const result = await ragService.generateWithContext('Generate a full adder');
    
    console.log('📋 Response received:', result.response.length > 0 ? 'Yes' : 'No');
    console.log('🎯 Context used:', result.context_used ? 'Yes' : 'No');
    
    if (result.context_used) {
      console.log('📖 Context preview:', result.context_used.substring(0, 200) + '...');
    }
    
    console.log('✅ RAG test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ RAG test failed:', error.message);
    return false;
  }
}

// Test without RAG (basic generation)
async function testBasicGeneration() {
  console.log('🔧 Testing basic generation (fallback)...');
  
  try {
    const { PinnacleAgent } = require('../agent/pinnacleAgent');
    const agent = new PinnacleAgent();
    
    const result = await agent.generateResponse('Generate a simple AND gate');
    console.log('📋 Basic generation works:', result.response.length > 0 ? 'Yes' : 'No');
    
    return true;
  } catch (error) {
    console.error('❌ Basic generation failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Running RAG System Tests\\n');
  
  const ragWorking = await testRAG();
  console.log('\\n' + '='.repeat(50) + '\\n');
  
  const basicWorking = await testBasicGeneration();
  
  console.log('\\n' + '='.repeat(50));
  console.log('📊 Test Results:');
  console.log(`RAG System: ${ragWorking ? '✅ Working' : '❌ Failed'}`);
  console.log(`Basic Generation: ${basicWorking ? '✅ Working' : '❌ Failed'}`);
  
  if (ragWorking) {
    console.log('\\n🎉 RAG is working! Your agent will use context-aware generation.');
  } else if (basicWorking) {
    console.log('\\n⚠️  RAG failed, but basic generation works. Agent will use fallback mode.');
  } else {
    console.log('\\n💥 Both RAG and basic generation failed. Check Ollama connection.');
  }
}

if (require.main === module) {
  runAllTests();
}

module.exports = { testRAG, testBasicGeneration, runAllTests };