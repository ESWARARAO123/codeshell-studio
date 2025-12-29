// Language detection and execution configuration based on file extensions

const languageMap = {
  '.js': { language: 'javascript', runner: 'node', args: [] },
  '.py': { language: 'python', runner: 'python', args: [] },
  '.java': { language: 'java', runner: 'javac', compile: true, runWith: 'java' },
  '.c': { language: 'c', runner: 'gcc', args: ['-o', 'temp'], compile: true, runWith: './temp' },
  '.cpp': { language: 'cpp', runner: 'g++', args: ['-o', 'temp'], compile: true, runWith: './temp' },
  '.go': { language: 'go', runner: 'go', args: ['run'] },
  '.php': { language: 'php', runner: 'php', args: [] },
  '.rb': { language: 'ruby', runner: 'ruby', args: [] },
  '.sh': { language: 'bash', runner: 'bash', args: [] },
  '.html': { language: 'html', runner: null },
  '.css': { language: 'css', runner: null },
  '.json': { language: 'json', runner: null },
  '.md': { language: 'markdown', runner: null }
};

function detectLanguage(filename) {
  if (!filename) return { language: 'text', runner: null };
  
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  const config = languageMap[ext];
  
  return config || { language: 'text', runner: null };
}

function getExecutionCommand(filename) {
  const config = detectLanguage(filename);
  
  if (!config.runner) {
    return { canExecute: false, reason: `${config.language} files cannot be executed` };
  }
  
  return {
    canExecute: true,
    language: config.language,
    runner: config.runner,
    args: config.args || [],
    compile: config.compile || false,
    runWith: config.runWith
  };
}

module.exports = { detectLanguage, getExecutionCommand };