# Ollama CodeLlama Setup Instructions

## Prerequisites

The Pinnacle IDE agents now use **CodeLlama** via **Ollama** for AI-powered code assistance.

## Installation Steps

### 1. Install Ollama

**Windows:**
```bash
# Download and install from: https://ollama.ai/download
# Or use winget:
winget install Ollama.Ollama
```

**macOS:**
```bash
# Download from: https://ollama.ai/download
# Or use Homebrew:
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Install CodeLlama Model

```bash
# Pull the CodeLlama model (this may take a few minutes)
ollama pull codellama

# Verify installation
ollama list
```

### 3. Start Ollama Service

```bash
# Start Ollama (runs on http://localhost:11434)
ollama serve
```

### 4. Test Connection

```bash
# Test CodeLlama is working
ollama run codellama "Write a hello world function in JavaScript"
```

## Agent Capabilities

With CodeLlama integration, the agents now provide:

### 🔍 Code Review Agent
- **Deep code analysis** using AI
- **Security vulnerability detection**
- **Performance optimization suggestions**
- **Best practices recommendations**

### 💡 Code Suggestion Agent  
- **Intelligent code completions**
- **Context-aware suggestions**
- **Refactoring recommendations**
- **Pattern improvements**

### ⚡ Code Generation Agent
- **Complete code generation** from descriptions
- **Function and class creation**
- **Component generation**
- **API endpoint creation**

## Usage

1. **Ensure Ollama is running** (`ollama serve`)
2. **Open Pinnacle IDE** and select an agent
3. **Open a code file** for context
4. **Ask questions or request code** - agents will use CodeLlama for intelligent responses

## Troubleshooting

- **Connection Error**: Ensure Ollama is running on port 11434
- **Model Not Found**: Run `ollama pull codellama`
- **Slow Responses**: CodeLlama requires significant compute resources

## Model Information

- **Model**: CodeLlama (7B parameters)
- **Specialization**: Code generation, completion, and analysis
- **Languages**: JavaScript, TypeScript, Python, Java, C++, and more
- **Local**: Runs entirely on your machine (no data sent to external servers)