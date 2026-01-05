import React, { useState } from 'react';
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

const menuItems = [
  {
    label: 'File',
    items: [
      { label: 'New File', shortcut: '⌘N' },
      { label: 'New Window', shortcut: '⇧⌘N' },
      { type: 'separator' },
      { label: 'Open File...', shortcut: '⌘O' },
      { label: 'Open Folder...', shortcut: '⌘K ⌘O', action: 'openFolder' },
      { type: 'separator' },
      { label: 'Save', shortcut: '⌘S' },
      { label: 'Save As...', shortcut: '⇧⌘S' },
      { type: 'separator' },
      { label: 'Close Editor', shortcut: '⌘W' },
      { label: 'Close Window', shortcut: '⇧⌘W' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Undo', shortcut: '⌘Z' },
      { label: 'Redo', shortcut: '⇧⌘Z' },
      { type: 'separator' },
      { label: 'Cut', shortcut: '⌘X' },
      { label: 'Copy', shortcut: '⌘C' },
      { label: 'Paste', shortcut: '⌘V' },
      { type: 'separator' },
      { label: 'Find', shortcut: '⌘F' },
      { label: 'Replace', shortcut: '⌥⌘F' },
    ],
  },
  {
    label: 'View',
    items: [
      { label: 'Command Palette...', shortcut: '⇧⌘P' },
      { type: 'separator' },
      { label: 'Explorer', shortcut: '⇧⌘E' },
      { label: 'Search', shortcut: '⇧⌘F' },
      { label: 'Source Control', shortcut: '⌃⇧G' },
      { type: 'separator' },
      { label: 'Terminal', shortcut: '⌃`' },
      { label: 'Problems', shortcut: '⇧⌘M' },
    ],
  },
  {
    label: 'Run',
    items: [
      { label: 'Start Debugging', shortcut: 'F5' },
      { label: 'Run Without Debugging', shortcut: '⌃F5' },
      { label: 'Stop Debugging', shortcut: '⇧F5' },
      { type: 'separator' },
      { label: 'Add Configuration...' },
      { label: 'Open Configurations' },
    ],
  },
  {
    label: 'Terminal',
    items: [
      { label: 'New Terminal', shortcut: '⌃⇧`' },
      { label: 'Split Terminal', shortcut: '⌘\\' },
      { type: 'separator' },
      { label: 'Run Task...' },
      { label: 'Run Build Task...', shortcut: '⇧⌘B' },
    ],
  },
  {
    label: 'Help',
    items: [
      { label: 'Welcome' },
      { label: 'Documentation' },
      { label: 'Release Notes' },
      { type: 'separator' },
      { label: 'Keyboard Shortcuts', shortcut: '⌘K ⌘S' },
      { type: 'separator' },
      { label: 'About' },
    ],
  },
];

export function MenuBar() {
  const { openWorkspace } = useEditor();

  const handleOpenFolder = async () => {
    try {
      // For web browsers, we'll use a folder selection dialog
      // First, get available root directories from the backend
      const response = await fetch('http://localhost:3010/api/files');
      const rootDirs = await response.json();
      
      // Create a simple selection dialog
      const folderOptions = rootDirs.map((dir, index) => `${index + 1}. ${dir.name} (${dir.path})`).join('\n');
      const selection = prompt(`Select a folder to open:\n\n${folderOptions}\n\nEnter the number (1-${rootDirs.length}) or type a custom path:`);
      
      if (selection) {
        const selectionNum = parseInt(selection);
        if (selectionNum >= 1 && selectionNum <= rootDirs.length) {
          // User selected a numbered option
          await openWorkspace(rootDirs[selectionNum - 1].path);
        } else {
          // User entered a custom path
          await openWorkspace(selection);
        }
      }
    } catch (error) {
      console.error('Failed to open folder:', error);
      alert('Failed to open folder. Please check the path and try again.');
    }
  };

  const handleMenuClick = (action?: string) => {
    if (action === 'openFolder') {
      handleOpenFolder();
    }
  };
  return (
    <div className="h-8 bg-pinnacle-titlebar flex items-center px-2 border-b border-border">
      <Menubar className="border-none bg-transparent h-full">
        {menuItems.map((menu) => (
          <MenubarMenu key={menu.label}>
            <MenubarTrigger className="text-xs text-muted-foreground hover:text-foreground hover:bg-pinnacle-hover px-2 py-1 rounded-sm cursor-pointer data-[state=open]:bg-pinnacle-hover data-[state=open]:text-foreground">
              {menu.label}
            </MenubarTrigger>
            <MenubarContent className="bg-pinnacle-sidebar border-border min-w-[200px]">
              {menu.items.map((item, index) =>
                item.type === 'separator' ? (
                  <MenubarSeparator key={index} className="bg-border" />
                ) : (
                  <MenubarItem
                    key={item.label}
                    className="text-sm text-foreground hover:bg-pinnacle-selection cursor-pointer focus:bg-pinnacle-selection focus:text-foreground"
                    onClick={() => handleMenuClick(item.action)}
                  >
                    {item.label}
                    {item.shortcut && (
                      <MenubarShortcut className="text-muted-foreground">
                        {item.shortcut}
                      </MenubarShortcut>
                    )}
                  </MenubarItem>
                )
              )}
            </MenubarContent>
          </MenubarMenu>
        ))}
      </Menubar>
      <div className="flex-1" />
      <span className="text-xs text-muted-foreground">my-pinnacle-project</span>
    </div>
  );
}
