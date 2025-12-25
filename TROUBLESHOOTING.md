# Agent Troubleshooting Guide

## Quick Fixes for Non-Responding Agents

### 1. Check Backend Server
```bash
# Make sure backend is running on port 3001
curl http://localhost:3001/api/agent/status
```

### 2. Test Agent Connectivity
```bash
# Run the agent test script
npm run test-agents
```

### 3. Check Ollama Service
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start Ollama
ollama serve

# Pull CodeLlama model if needed
ollama pull codellama
```

### 4. Test API Endpoints
```bash
# Test agent processing endpoint
curl -X POST http://localhost:3001/api/agent/process \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","agentType":"review"}'
```

## Common Issues and Solutions

### Issue: "Connection refused" or "fetch failed"
**Solution**: 
- Ensure backend server is running: `npm run dev`
- Check if port 3001 is available
- Verify no firewall blocking the connection

### Issue: "Ollama not accessible"
**Solution**:
- Start Ollama service: `ollama serve`
- Install CodeLlama: `ollama pull codellama`
- Check Ollama is on port 11434: `netstat -an | findstr 11434`

### Issue: "Empty responses from agents"
**Solution**:
- Check Ollama model is loaded: `ollama list`
- Verify CodeLlama model exists
- Test with simple prompt: `ollama run codellama "Hello"`

### Issue: "Frontend can't connect to backend"
**Solution**:
- Check API URL in AgentView.tsx points to `http://localhost:3001`
- Verify CORS is enabled in backend
- Check browser console for network errors

## Startup Checklist

1. ✅ Ollama service running (`ollama serve`)
2. ✅ CodeLlama model available (`ollama list`)
3. ✅ Backend server running (`npm run dev`)
4. ✅ Frontend running (`npm run frontend`)
5. ✅ No port conflicts (3001, 5174, 11434)

## Testing Commands

```bash
# Test everything at once
npm run startup

# Test agents only
npm run test-agents

# Manual testing
curl http://localhost:3001/api/agent/test
```

## Log Locations

- **Backend logs**: Console output from `npm run dev`
- **Frontend logs**: Browser developer console
- **Ollama logs**: Ollama service console

## Performance Tips

1. **Increase timeout** if responses are slow:
   - Edit `ollamaService.js` timeout from 30000 to 60000
   
2. **Reduce model temperature** for more consistent responses:
   - Edit `ollamaService.js` temperature from 0.7 to 0.3

3. **Use smaller prompts** for faster responses:
   - Keep code snippets under 1000 characters when possible