#!/usr/bin/env node

// Test script to demonstrate auto-detection system
const { detectLanguage, getExecutionCommand } = require('./utils/languageDetector');

const testFiles = [
  'app.py',
  'script.js', 
  'Main.java',
  'program.c',
  'program.cpp',
  'main.go',
  'script.php',
  'script.rb',
  'script.sh',
  'index.html',
  'style.css',
  'data.json',
  'README.md',
  'unknown.xyz'
];

console.log('🔍 Auto-Detection System Test\n');
console.log('File Extension → Language → Executable → Runner');
console.log('='.repeat(50));

testFiles.forEach(filename => {
  const detection = detectLanguage(filename);
  const execution = getExecutionCommand(filename);
  
  const ext = filename.substring(filename.lastIndexOf('.'));
  const executable = execution.canExecute ? '✅' : '❌';
  const runner = execution.canExecute ? execution.runner : 'N/A';
  const compile = execution.compile ? ' (compile)' : '';
  
  console.log(`${ext.padEnd(8)} → ${detection.language.padEnd(12)} → ${executable} → ${runner}${compile}`);
});

console.log('\n🚀 Execution Examples:');
console.log('- Python: python filename.py');
console.log('- JavaScript: node filename.js');  
console.log('- Java: javac filename.java (compile first)');
console.log('- C/C++: gcc/g++ filename.c (compile first)');
console.log('- Go: go run filename.go');
console.log('- PHP: php filename.php');
console.log('- Ruby: ruby filename.rb');
console.log('- Shell: bash filename.sh');