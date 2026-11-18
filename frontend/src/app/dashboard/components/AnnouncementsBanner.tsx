'use client';

import React from 'react';
import { Bell, Info } from 'lucide-react';

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  publishedAt?: string;
  createdAt?: string;
}

interface AnnouncementsBannerProps {
  announcements: AnnouncementItem[];
}

export default function AnnouncementsBanner({ announcements }: AnnouncementsBannerProps) {
  if (!announcements || announcements.length === 0) return null;

  return (
    <div className="bg-slate-900 border-amber-500 rounded-2xl p-4 shadow-lg space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-white font-bold text-xs tracking-wider">
          <Bell className="w-4 h-4 animate-pulse text-amber-400" />
          <span>PENGUMUMAN PANITIA PMB</span>
        </div>

        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
          {announcements.length} Informasi
        </span>
      </div>

      <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 hover:bg-slate-950 p-3 rounded-xl border border-slate-800/80 transition-all space-y-1"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-slate-100 text-xs flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>{item.title}</span>
              </h4>

              <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                {new Date(item.publishedAt || item.createdAt || '').toLocaleDateString('id-ID')}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed pl-5 whitespace-pre-line">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
