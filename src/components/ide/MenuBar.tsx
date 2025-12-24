import React from 'react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { useEditor } from '@/context/EditorContext';

export function MenuBar() {
  const {
    handleNewFile,
    handleOpenFile,
    handleOpenFolder,
    handleSave,
    handleSaveAs,
    closeTab,
    activeTabId,
    isFileSystemSupported,
    projectName,
    toggleSidebar,
    toggleBottomPanel,
    setActiveView,
  } = useEditor();

  const handleCloseEditor = () => {
    if (activeTabId) {
      closeTab(activeTabId);
    }
  };

  return (
    <div className="h-8 bg-vscode-titlebar flex items-center px-2 border-b border-border">
      <Menubar className="border-none bg-transparent h-full">
        {/* File Menu */}
        <MenubarMenu>
          <MenubarTrigger className="text-xs text-muted-foreground hover:text-foreground hover:bg-vscode-hover px-2 py-1 rounded-sm cursor-pointer data-[state=open]:bg-vscode-hover data-[state=open]:text-foreground">
            File
          </MenubarTrigger>
          <MenubarContent className="bg-vscode-sidebar border-border min-w-[200px]">
            <MenubarItem
              onClick={handleNewFile}
              className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground"
            >
              New File
              <MenubarShortcut className="text-muted-foreground">⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator className="bg-border" />
            <MenubarItem
              onClick={handleOpenFile}
              disabled={!isFileSystemSupported}
              className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground disabled:opacity-50"
            >
              Open File...
              <MenubarShortcut className="text-muted-foreground">⌘O</MenubarShortcut>
            </MenubarItem>
            <MenubarItem
              onClick={handleOpenFolder}
              disabled={!isFileSystemSupported}
              className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground disabled:opacity-50"
            >
              Open Folder...
              <MenubarShortcut className="text-muted-foreground">⌘K ⌘O</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator className="bg-border" />
            <MenubarItem
              onClick={handleSave}
              disabled={!isFileSystemSupported || !activeTabId}
              className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground disabled:opacity-50"
            >
              Save
              <MenubarShortcut className="text-muted-foreground">⌘S</MenubarShortcut>
            </MenubarItem>
            <MenubarItem
              onClick={handleSaveAs}
              disabled={!isFileSystemSupported || !activeTabId}
              className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground disabled:opacity-50"
            >
              Save As...
              <MenubarShortcut className="text-muted-foreground">⇧⌘S</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator className="bg-border" />
            <MenubarItem
              onClick={handleCloseEditor}
              disabled={!activeTabId}
              className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground disabled:opacity-50"
            >
              Close Editor
              <MenubarShortcut className="text-muted-foreground">⌘W</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Edit Menu */}
        <MenubarMenu>
          <MenubarTrigger className="text-xs text-muted-foreground hover:text-foreground hover:bg-vscode-hover px-2 py-1 rounded-sm cursor-pointer data-[state=open]:bg-vscode-hover data-[state=open]:text-foreground">
            Edit
          </MenubarTrigger>
          <MenubarContent className="bg-vscode-sidebar border-border min-w-[200px]">
            <MenubarItem className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground">
              Undo
              <MenubarShortcut className="text-muted-foreground">⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground">
              Redo
              <MenubarShortcut className="text-muted-foreground">⇧⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator className="bg-border" />
            <MenubarItem className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground">
              Cut
              <MenubarShortcut className="text-muted-foreground">⌘X</MenubarShortcut>
            </MenubarItem>
            <MenubarItem className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground">
              Copy
              <MenubarShortcut className="text-muted-foreground">⌘C</MenubarShortcut>
            </MenubarItem>
            <MenubarItem className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground">
              Paste
              <MenubarShortcut className="text-muted-foreground">⌘V</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator className="bg-border" />
            <MenubarItem className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground">
              Find
              <MenubarShortcut className="text-muted-foreground">⌘F</MenubarShortcut>
            </MenubarItem>
            <MenubarItem className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground">
              Replace
              <MenubarShortcut className="text-muted-foreground">⌥⌘F</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* View Menu */}
        <MenubarMenu>
          <MenubarTrigger className="text-xs text-muted-foreground hover:text-foreground hover:bg-vscode-hover px-2 py-1 rounded-sm cursor-pointer data-[state=open]:bg-vscode-hover data-[state=open]:text-foreground">
            View
          </MenubarTrigger>
          <MenubarContent className="bg-vscode-sidebar border-border min-w-[200px]">
            <MenubarItem className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground">
              Command Palette...
              <MenubarShortcut className="text-muted-foreground">⇧⌘P</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator className="bg-border" />
            <MenubarItem
              onClick={() => setActiveView('explorer')}
              className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground"
            >
              Explorer
              <MenubarShortcut className="text-muted-foreground">⇧⌘E</MenubarShortcut>
            </MenubarItem>
            <MenubarItem
              onClick={() => setActiveView('search')}
              className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground"
            >
              Search
              <MenubarShortcut className="text-muted-foreground">⇧⌘F</MenubarShortcut>
            </MenubarItem>
            <MenubarItem
              onClick={() => setActiveView('git')}
              className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground"
            >
              Source Control
              <MenubarShortcut className="text-muted-foreground">⌃⇧G</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator className="bg-border" />
            <MenubarItem
              onClick={toggleSidebar}
              className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground"
            >
              Toggle Sidebar
              <MenubarShortcut className="text-muted-foreground">⌘B</MenubarShortcut>
            </MenubarItem>
            <MenubarItem
              onClick={toggleBottomPanel}
              className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground"
            >
              Toggle Terminal
              <MenubarShortcut className="text-muted-foreground">⌃`</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Run Menu */}
        <MenubarMenu>
          <MenubarTrigger className="text-xs text-muted-foreground hover:text-foreground hover:bg-vscode-hover px-2 py-1 rounded-sm cursor-pointer data-[state=open]:bg-vscode-hover data-[state=open]:text-foreground">
            Run
          </MenubarTrigger>
          <MenubarContent className="bg-vscode-sidebar border-border min-w-[200px]">
            <MenubarItem className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground">
              Start Debugging
              <MenubarShortcut className="text-muted-foreground">F5</MenubarShortcut>
            </MenubarItem>
            <MenubarItem className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground">
              Run Without Debugging
              <MenubarShortcut className="text-muted-foreground">⌃F5</MenubarShortcut>
            </MenubarItem>
            <MenubarItem className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground">
              Stop Debugging
              <MenubarShortcut className="text-muted-foreground">⇧F5</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Terminal Menu */}
        <MenubarMenu>
          <MenubarTrigger className="text-xs text-muted-foreground hover:text-foreground hover:bg-vscode-hover px-2 py-1 rounded-sm cursor-pointer data-[state=open]:bg-vscode-hover data-[state=open]:text-foreground">
            Terminal
          </MenubarTrigger>
          <MenubarContent className="bg-vscode-sidebar border-border min-w-[200px]">
            <MenubarItem
              onClick={toggleBottomPanel}
              className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground"
            >
              New Terminal
              <MenubarShortcut className="text-muted-foreground">⌃⇧`</MenubarShortcut>
            </MenubarItem>
            <MenubarItem className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground">
              Split Terminal
              <MenubarShortcut className="text-muted-foreground">⌘\</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Help Menu */}
        <MenubarMenu>
          <MenubarTrigger className="text-xs text-muted-foreground hover:text-foreground hover:bg-vscode-hover px-2 py-1 rounded-sm cursor-pointer data-[state=open]:bg-vscode-hover data-[state=open]:text-foreground">
            Help
          </MenubarTrigger>
          <MenubarContent className="bg-vscode-sidebar border-border min-w-[200px]">
            <MenubarItem className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground">
              Welcome
            </MenubarItem>
            <MenubarItem className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground">
              Documentation
            </MenubarItem>
            <MenubarSeparator className="bg-border" />
            <MenubarItem className="text-sm text-foreground hover:bg-vscode-selection cursor-pointer focus:bg-vscode-selection focus:text-foreground">
              About
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <div className="flex-1" />
      <span className="text-xs text-muted-foreground">{projectName}</span>
    </div>
  );
}
