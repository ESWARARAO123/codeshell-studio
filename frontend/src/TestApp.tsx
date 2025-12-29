import React from 'react';

const TestApp = () => {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      background: '#1a1a1a',
      color: 'white',
      minHeight: '100vh'
    }}>
      <h1>🚀 Pinnacle IDE Test</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ marginTop: '20px' }}>
        <h2>Status:</h2>
        <ul>
          <li>✅ React is rendering</li>
          <li>✅ TypeScript is compiling</li>
          <li>✅ Vite is serving</li>
        </ul>
      </div>
      <button 
        onClick={() => alert('Button works!')}
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
        Test Button
      </button>
    </div>
  );
};

export default TestApp;