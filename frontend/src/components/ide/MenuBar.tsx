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

const menuItems = [
  {
    label: 'File',
    items: [
      { label: 'New File', shortcut: '⌘N' },
      { label: 'New Window', shortcut: '⇧⌘N' },
      { type: 'separator' },
      { label: 'Open File...', shortcut: '⌘O' },
      { label: 'Open Folder...', shortcut: '⌘K ⌘O' },
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
