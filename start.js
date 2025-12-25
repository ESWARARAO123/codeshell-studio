#!/usr/bin/env node

// Startup script for Pinnacle IDE
const { spawn } = require('child_process');
const { OllamaService } = require('./agent/ollamaService');

async function checkOllama() {
  console.log('🔍 Checking Ollama service...');
  try {
    const ollama = new OllamaService();
    const isConnected = await ollama.checkConnection();
    
    if (isConnected) {
      console.log('✅ Ollama is running and accessible');
      return true;
    } else {
      console.log('❌ Ollama is not accessible');
      console.log('💡 Please ensure Ollama is running with: ollama serve');
      console.log('💡 And CodeLlama model is available with: ollama pull codellama');
      return false;
    }
  } catch (error) {
    console.log('❌ Ollama check failed:', error.message);
    return false;
  }
}

async function startServices() {
  console.log('🚀 Starting Pinnacle IDE Services...\n');
  
  // Check Ollama first
  const ollamaOk = await checkOllama();
  
  if (!ollamaOk) {
    console.log('\n⚠️  Warning: Ollama is not available. Agents will use fallback responses.');
    console.log('   You can still use the IDE, but AI features will be limited.\n');
  }
  
  console.log('🖥️  Starting backend server...');
  const backend = spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit',
    shell: true 
  });
  
  // Wait a moment for backend to start
  setTimeout(() => {
    console.log('🌐 Starting frontend...');
    const frontend = spawn('npm', ['run', 'frontend'], { 
      stdio: 'inherit',
      shell: true 
    });
    
    frontend.on('error', (error) => {
      console.error('Frontend error:', error);
    });
  }, 2000);
  
  backend.on('error', (error) => {
    console.error('Backend error:', error);
  });
  
  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down services...');
    backend.kill();
    process.exit(0);
  });
}

startServices().catch(console.error);