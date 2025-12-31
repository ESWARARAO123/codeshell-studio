const { RAGService } = require('./ragService');

async function setupRAG() {
  console.log('🚀 Setting up RAG system...');
  
  try {
    const ragService = new RAGService();
    
    console.log('📊 Initializing vector database...');
    await ragService.initialize();
    
    console.log('📝 Indexing context file...');
    await ragService.indexContext();
    
    console.log('✅ RAG system setup complete!');
    console.log('🔍 Testing with sample query...');
    
    const testResult = await ragService.generateWithContext('Generate a simple counter');
    console.log('📋 Test result:', testResult.response.substring(0, 200) + '...');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

if (require.main === module) {
  setupRAG();
}

module.exports = { setupRAG };