import React from 'react';
import { IDELayout } from '@/components/ide/IDELayout';

const Index = () => {
  console.log('Index component rendering...');
  
  try {
    return <IDELayout />;
  } catch (error) {
    console.error('Error in Index component:', error);
    return (
      <div style={{ padding: '20px', color: 'white', background: '#1a1a1a' }}>
        <h1>Error Loading IDE</h1>
        <p>Check console for details</p>
      </div>
    );
  }
};

export default Index;
