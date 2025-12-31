const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { ChromaClient } = require('chromadb');

class VectorDB {
  constructor() {
    this.client = new ChromaClient();
    this.collection = null;
    this.collectionName = 'verilog_context';
    this.embeddingModel = 'nomic-embed-text:latest';
    this.ollamaUrl = 'http://localhost:11434/api/embeddings';
  }

  async initialize() {
    try {
      this.collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
        metadata: { description: 'Verilog RTL context embeddings' }
      });
      console.log('Vector database initialized');
    } catch (error) {
      console.error('Failed to initialize vector database:', error);
      throw error;
    }
  }

  async generateEmbedding(text) {
    try {
      const response = await axios.post(this.ollamaUrl, {
        model: this.embeddingModel,
        prompt: text
      });
      return response.data.embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw error;
    }
  }

  async addDocument(id, text, metadata = {}) {
    const embedding = await this.generateEmbedding(text);
    await this.collection.add({
      ids: [id],
      embeddings: [embedding],
      documents: [text],
      metadatas: [metadata]
    });
  }

  async search(query, nResults = 3) {
    const queryEmbedding = await this.generateEmbedding(query);
    const results = await this.collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: nResults
    });
    return results;
  }

  async processMarkdownFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const chunks = this.chunkMarkdown(content);
      
      console.log(`Processing ${chunks.length} chunks from ${filePath}`);
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        await this.addDocument(
          `chunk_${i}`,
          chunk.content,
          { 
            source: filePath,
            section: chunk.section,
            chunk_id: i
          }
        );
        console.log(`Added chunk ${i + 1}/${chunks.length}`);
      }
      
      console.log('Markdown file processed successfully');
    } catch (error) {
      console.error('Failed to process markdown file:', error);
      throw error;
    }
  }

  chunkMarkdown(content) {
    const chunks = [];
    const sections = content.split(/^##\s+/m);
    
    sections.forEach((section, index) => {
      if (section.trim()) {
        const lines = section.split('\n');
        const title = index === 0 ? 'Introduction' : lines[0];
        const content = index === 0 ? section : lines.slice(1).join('\n');
        
        if (content.trim().length > 100) {
          chunks.push({
            section: title.trim(),
            content: content.trim()
          });
        }
      }
    });
    
    return chunks;
  }
}

module.exports = { VectorDB };