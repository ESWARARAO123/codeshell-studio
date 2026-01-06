# Hybrid Setup: Ollama + Gemini API

## Prerequisites

- **Node.js** (v18 or higher)
- **Ollama** installed and running (for embeddings)
- **Google Gemini API Key** (for text generation)

## Installation Steps

1. **Install Ollama and Models**:
   ```bash
   # Install embedding model for RAG
   ollama pull nomic-embed-text:latest
   ```

2. **Get Gemini API Key**:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to the `.env` file

3. **Install Dependencies**:
   ```bash
   npm install @google/generative-ai axios express cors dotenv
   ```

4. **Update .env file**:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

5. **Run the Application**:
   ```bash
   npm run dev
   ```

## Architecture

- **RAG System (Embeddings)**: Uses Ollama `nomic-embed-text:latest`
- **Text Generation**: Uses Gemini API `gemini-pro`
- **Vector Database**: Local in-memory with Ollama embeddings
- **File Operations**: Local file system

## Benefits

- **Fast Embeddings**: Local Ollama for quick context retrieval
- **Advanced Generation**: Cloud Gemini for better code quality
- **Privacy**: Embeddings stay local, only queries go to Gemini
- **Reliability**: Fallback embedding if Ollama fails