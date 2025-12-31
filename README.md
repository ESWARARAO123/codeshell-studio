# Pinnacle IDE - Verilog Code Generator with RAG

A modern IDE for Verilog RTL design with AI-powered code generation using Ollama and Retrieval-Augmented Generation (RAG).

## 🚀 Features

- **AI-Powered Verilog Generation**: Generate synthesizable RTL code using Ollama's `qwen2.5-coder:3b` model
- **RAG-Enhanced Context**: Uses your RTL design guidelines for context-aware code generation
- **Modern IDE Interface**: Built with React, TypeScript, and Tailwind CSS
- **Real-time Code Visualization**: Special formatting for Verilog modules with syntax highlighting
- **File Management**: Complete file explorer with create, edit, delete operations

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Ollama** installed and running
- **Required Ollama Models**:
  - `qwen2.5-coder:3b` (for code generation)
  - `nomic-embed-text:latest` (for embeddings)

### Install Ollama Models

```bash
# Install code generation model
ollama pull qwen2.5-coder:3b

# Install embedding model
ollama pull nomic-embed-text:latest
```

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd codeshell-studio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

## 🚀 Running the Application

### Start Backend Server

```bash
npm run dev
```

The backend will:
- Start on port 3010
- Automatically initialize the RAG system
- Index your RTL context file (`rag/RTL_Verilog_LLM_Context_v2.md`)
- Create embeddings for context-aware generation

**Console Output:**
```
🚀 Initializing RAG system...
Processing 14 chunks from RTL_Verilog_LLM_Context_v2.md
Added document: chunk_0
...
✅ RAG system ready!
Server running on http://localhost:3010
```

### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will start on port 5174 (or next available port).

## 🎯 RAG System

### What is RAG?

Retrieval-Augmented Generation (RAG) enhances the AI model with your specific RTL design context:

1. **Context Indexing**: Your RTL guidelines are chunked and converted to embeddings
2. **Query Processing**: User queries search for relevant context using vector similarity
3. **Enhanced Generation**: The AI generates code using both the query and relevant context

### RAG Status Indicators

In the frontend, look for the status indicator in the agent header:
- 🟢 **"RAG Ready"** - Context-aware generation active
- 🟡 **"Basic Mode"** - Fallback mode (RAG failed)

### Testing RAG

**Check if RAG is working:**
```bash
node rag/checkRAG.js
```

**Expected output:**
```
🧪 Testing RAG System...
✅ RAG service initialized
✅ Context indexed
🔍 Testing query: "Generate a full adder"
📋 Response received: Yes
🎯 Context used: Yes
🎉 RAG is working! Your agent will use context-aware generation.
```

## 💡 Usage Examples

### Context-Aware Queries

Try these queries to see RAG in action:

1. **"Generate a full adder"**
   - Uses RTL context patterns
   - Follows your design guidelines
   - Includes proper reset logic

2. **"Create a counter with reset"**
   - References context examples
   - Uses synchronous reset patterns
   - Follows RTL naming conventions

3. **"Design a simple FSM"**
   - Uses FSM templates from context
   - Separates state register and next-state logic
   - Follows enum patterns

4. **"Make a parameterized multiplexer"**
   - Uses parameterization examples
   - Follows RTL coding standards

### Code Visualization

The frontend automatically detects Verilog code and displays it with:
- **Dark terminal-style background**
- **Green syntax highlighting**
- **Monospace font**
- **Proper indentation**

Text before and after code blocks is displayed normally.

## 🔧 API Endpoints

### Agent Chat
```http
POST /api/agent/chat
Content-Type: application/json

{
  "message": "Generate a full adder",
  "context": {}
}
```

### Agent Status
```http
GET /api/agent/status

Response:
{
  "agent_ready": true,
  "rag_ready": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📁 Project Structure

```
codeshell-studio/
├── agent/
│   └── pinnacleAgent.js      # Main AI agent with RAG integration
├── rag/
│   ├── simpleVectorDB.js     # In-memory vector database
│   ├── ragService.js         # RAG service implementation
│   ├── checkRAG.js          # RAG testing script
│   └── RTL_Verilog_LLM_Context_v2.md  # RTL design context
├── frontend/
│   └── src/
│       └── components/
│           └── ide/
│               └── AgentView.tsx  # Chat interface
├── index.js                  # Express server
└── package.json
```

## 🐛 Troubleshooting

### RAG Not Working

1. **Check Ollama is running**:
   ```bash
   ollama list
   ```

2. **Verify models are installed**:
   ```bash
   ollama list | grep qwen2.5-coder
   ollama list | grep nomic-embed-text
   ```

3. **Test RAG system**:
   ```bash
   node rag/checkRAG.js
   ```

### Connection Issues

1. **Backend not starting**:
   - Check if port 3010 is available
   - Kill any existing node processes: `taskkill /F /IM node.exe`

2. **Frontend can't connect**:
   - Ensure backend is running on port 3010
   - Check browser console for CORS errors

### Model Issues

1. **"Model not found" error**:
   ```bash
   ollama pull qwen2.5-coder:3b
   ollama pull nomic-embed-text:latest
   ```

2. **Slow responses**:
   - Ensure sufficient RAM (8GB+ recommended)
   - Close other applications

## 🎨 Customization

### Adding Your Own Context

Edit `rag/RTL_Verilog_LLM_Context_v2.md` to include:
- Your coding standards
- Design patterns
- Company-specific guidelines
- Custom modules and examples

The RAG system will automatically use your updated context.

### Changing Models

In `agent/pinnacleAgent.js`, update:
```javascript
this.model = "your-preferred-model";
```

In `rag/simpleVectorDB.js`, update:
```javascript
this.embeddingModel = 'your-embedding-model';
```

## 📊 Performance

- **RAG Initialization**: ~10-30 seconds (depending on context size)
- **Query Response**: ~2-10 seconds (depending on model and query complexity)
- **Memory Usage**: ~2-4GB (with loaded models)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `node rag/checkRAG.js`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Happy RTL Design! 🚀**