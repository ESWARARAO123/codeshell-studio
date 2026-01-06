const axios = require('axios');
const fs = require('fs').promises;

class SimpleVectorDB {
  constructor() {
    this.documents = [];
    this.embeddingModel = 'nomic-embed-text:latest';
    this.ollamaUrl = 'http://localhost:11434/api/embeddings';
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
      return this.simpleTextEmbedding(text);
    }
  }

  simpleTextEmbedding(text) {
    const embedding = new Array(100).fill(0);
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) % 100;
      embedding[charCode] += 1;
    }
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
  }

  cosineSimilarity(a, b) {
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async addDocument(id, text, metadata = {}) {
    const embedding = await this.generateEmbedding(text);
    this.documents.push({
      id,
      text,
      embedding,
      metadata
    });
    console.log(`Added document: ${id}`);
  }

  async search(query, nResults = 3) {
    const queryEmbedding = await this.generateEmbedding(query);
    
    const similarities = this.documents.map(doc => ({
      ...doc,
      similarity: this.cosineSimilarity(queryEmbedding, doc.embedding)
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);
    
    return {
      documents: [similarities.slice(0, nResults).map(doc => doc.text)],
      metadatas: [similarities.slice(0, nResults).map(doc => doc.metadata)],
      distances: [similarities.slice(0, nResults).map(doc => 1 - doc.similarity)]
    };
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

module.exports = { SimpleVectorDB };