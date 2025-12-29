import React from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { EditorProvider, useEditor } from '@/context/EditorContext';
import { MenuBar } from './MenuBar';
import { ActivityBar } from './ActivityBar';
import { Sidebar } from './Sidebar';
import { EditorTabs } from './EditorTabs';
import { CodeEditor } from './CodeEditor';
import { BottomPanel } from './BottomPanel';
import { StatusBar } from './StatusBar';

function IDEContent() {
  console.log('IDEContent rendering...');
  
  try {
    const { isSidebarOpen, isBottomPanelOpen } = useEditor();
    console.log('Editor context loaded:', { isSidebarOpen, isBottomPanelOpen });

    return (
      <div className="h-screen flex flex-col bg-pinnacle-bg overflow-hidden">
        <MenuBar />
        <div className="flex-1 flex overflow-hidden">
          <ActivityBar />
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {isSidebarOpen && (
              <>
                <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
                  <Sidebar />
                </ResizablePanel>
                <ResizableHandle className="w-1 bg-border hover:bg-primary transition-colors" />
              </>
            )}
            <ResizablePanel defaultSize={80}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={isBottomPanelOpen ? 70 : 100} minSize={30}>
                  <div className="flex flex-col h-full">
                    <EditorTabs />
                    <CodeEditor />
                  </div>
                </ResizablePanel>
                {isBottomPanelOpen && (
                  <>
                    <ResizableHandle className="h-1 bg-border hover:bg-primary transition-colors" />
                    <ResizablePanel defaultSize={30} minSize={15} maxSize={50}>
                      <BottomPanel />
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        <StatusBar />
      </div>
    );
  } catch (error) {
    console.error('Error in IDEContent:', error);
    return (
      <div style={{ padding: '20px', color: 'white', background: '#1a1a1a' }}>
        <h1>IDE Loading Error</h1>
        <p>Error: {error.message}</p>
      </div>
    );
  }
}

export function IDELayout() {
  console.log('IDELayout rendering...');
  
  try {
    return (
      <EditorProvider>
        <IDEContent />
      </EditorProvider>
    );
  } catch (error) {
    console.error('Error in IDELayout:', error);
    return (
      <div style={{ padding: '20px', color: 'white', background: '#1a1a1a' }}>
        <h1>IDE Provider Error</h1>
        <p>Error: {error.message}</p>
      </div>
    );
  }
}
