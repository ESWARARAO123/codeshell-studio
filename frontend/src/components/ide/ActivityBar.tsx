import React from 'react';
import { Files, Search, GitBranch, Play, Puzzle, Settings, Bot } from 'lucide-react';
import { useEditor } from '@/context/EditorContext';
import { ActivityView } from '@/types/editor';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const activityItems: { id: ActivityView; icon: React.ElementType; label: string }[] = [
  { id: 'explorer', icon: Files, label: 'Explorer' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'git', icon: GitBranch, label: 'Source Control' },
  { id: 'run', icon: Play, label: 'Run and Debug' },
  { id: 'extensions', icon: Puzzle, label: 'Extensions' },
  { id: 'agent', icon: Bot, label: 'Pinnacle Agent' },
];

export function ActivityBar() {
  const { activeView, setActiveView, isSidebarOpen, toggleSidebar } = useEditor();

  const handleClick = (viewId: ActivityView) => {
    if (activeView === viewId && isSidebarOpen) {
      toggleSidebar();
    } else {
      setActiveView(viewId);
      if (!isSidebarOpen) {
        toggleSidebar();
      }
    }
  };

  return (
    <div className="w-12 bg-pinnacle-activitybar flex flex-col items-center py-2 border-r border-border">
      <div className="flex flex-col gap-1">
        {activityItems.map((item) => (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleClick(item.id)}
                className={`activity-bar-icon ${activeView === item.id && isSidebarOpen ? 'active' : ''}`}
              >
                <item.icon size={24} strokeWidth={1.5} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-pinnacle-sidebar border-border">
              {item.label}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      <div className="flex-1" />
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="activity-bar-icon">
            <Settings size={24} strokeWidth={1.5} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-pinnacle-sidebar border-border">
          Settings
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
