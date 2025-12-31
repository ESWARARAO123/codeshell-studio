const { RAGService } = require('./ragService');

async function testRAG() {
  console.log('🧪 Testing RAG System...');
  
  const ragService = new RAGService();
  
  try {
    // Initialize
    await ragService.initialize();
    console.log('✅ RAG service initialized');
    
    // Index context
    await ragService.indexContext();
    console.log('✅ Context indexed');
    
    // Test queries
    const testQueries = [
      'Generate a full adder',
      'Create a counter with reset',
      'Design a simple FSM',
      'Make a parameterized multiplexer'
    ];
    
    for (const query of testQueries) {
      console.log(`\\n🔍 Testing: "${query}"`);
      const result = await ragService.generateWithContext(query);
      console.log('📝 Response length:', result.response.length);
      console.log('🎯 Context used:', result.context_used ? 'Yes' : 'No');
    }
    
    console.log('\\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

if (require.main === module) {
  testRAG();
}

module.exports = { testRAG };