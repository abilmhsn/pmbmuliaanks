'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import { TabType, TabDefinition } from '../types';

interface TabNavigationProps {
  activeTab: TabType;
  loading: boolean;
  canAccessTab: (tab: TabType) => boolean;
  goToTab: (tab: TabType) => void;
  tabDefinitions: TabDefinition[];
}

export default function TabNavigation({
  activeTab,
  loading,
  canAccessTab,
  goToTab,
  tabDefinitions,
}: TabNavigationProps) {
  return (
    <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-slate-200">
      <div className="flex items-center flex-nowrap w-max p-2 gap-2">
        {tabDefinitions.map((tab) => {
          const isLocked = !canAccessTab(tab.id);
          const TabIcon = tab.icon;

          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              type="button"
              disabled={loading || isLocked}
              onClick={() => goToTab(tab.id)}
              className={`px-4 py-3 text-xs font-bold flex items-center gap-2 rounded-xl whitespace-nowrap flex-shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white shadow-md shadow-sky-600/30'
                  : isLocked
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-70'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <TabIcon className="w-4 h-4 flex-shrink-0" />
              <span>{tab.label}</span>
              {isLocked && (
                <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
