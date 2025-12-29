import React from 'react';

const DebugApp = () => {
  console.log('DebugApp rendering...');
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      background: '#1a1a1a',
      color: 'white',
      minHeight: '100vh'
    }}>
      <h1>🔍 Debug Mode</h1>
      <p>Checking components step by step...</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Component Status:</h2>
        <div>✅ React is working</div>
        <div>✅ Basic rendering works</div>
        <div>✅ Styles are applied</div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Next Steps:</h2>
        <ol>
          <li>Check browser console for errors</li>
          <li>Verify all imports are working</li>
          <li>Test individual components</li>
        </ol>
      </div>
      
      <button 
        onClick={() => {
          console.log('Button clicked!');
          alert('Debug button works!');
        }}
        style={{
          background: '#007acc',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Debug Test
      </button>
    </div>
  );
};

export default DebugApp;