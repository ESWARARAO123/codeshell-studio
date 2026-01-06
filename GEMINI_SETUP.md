# Gemini API Setup Instructions

## Prerequisites

- **Node.js** (v18 or higher)
- **Google Gemini API Key**

## Installation Steps

1. **Get Gemini API Key**:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the API key

2. **Set Environment Variable**:
   ```bash
   # Windows
   set GEMINI_API_KEY=your_api_key_here
   
   # Linux/Mac
   export GEMINI_API_KEY=your_api_key_here
   ```

3. **Install Dependencies**:
   ```bash
   npm install @google/generative-ai express cors
   ```

4. **Update Files**:
   - Replace `package.json` with `package_gemini.json`
   - Replace `rag/simpleVectorDB.js` with `rag/simpleVectorDB_gemini.js`
   - The agent and RAG service are already updated

5. **Run the Application**:
   ```bash
   npm run dev
   ```

## Key Changes

- **Ollama** → **Google Gemini API**
- **Local Models** → **Cloud API**
- **nomic-embed-text** → **embedding-001**
- **qwen2.5-coder:3b** → **gemini-pro**

## Benefits

- No local model installation required
- Faster startup (no model loading)
- Better performance on lower-end hardware
- Always up-to-date models

## API Usage

The system now uses:
- `gemini-pro` for text generation
- `embedding-001` for text embeddings
- Same RAG functionality with cloud-based processing