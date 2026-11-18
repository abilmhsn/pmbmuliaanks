'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StudyProgramItem {
  id: string;
  code: string;
  name: string;
  description: string;
}

interface ProgramSelectionTabProps {
  programs: StudyProgramItem[];
  selectedProgramId: string;
  setSelectedProgramId: (id: string) => void;
  loading: boolean;
  onPrevious: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProgramSelectionTab({
  programs,
  selectedProgramId,
  setSelectedProgramId,
  loading,
  onPrevious,
  onSubmit,
}: ProgramSelectionTabProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900 border-b pb-3">
        Pilih Program Studi Unggulan
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {programs.map((prog) => (
          <div
            key={prog.id}
            onClick={() => setSelectedProgramId(prog.id)}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              selectedProgramId === prog.id
                ? 'border-sky-600 bg-sky-50/80 shadow-md ring-2 ring-sky-600/30'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-mono font-bold">
                  {prog.code}
                </span>

                <input
                  type="radio"
                  name="programSelection"
                  checked={selectedProgramId === prog.id}
                  onChange={() => setSelectedProgramId(prog.id)}
                  className="w-5 h-5 text-sky-600 focus:ring-sky-500"
                />
              </div>

              <h4 className="text-lg font-bold text-slate-900 mb-2">
                {prog.name}
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {prog.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t flex justify-between items-center gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={loading}
          className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-full flex items-center gap-2 transition-all active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali
        </button>

        <button
          type="submit"
          disabled={loading || !selectedProgramId}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm rounded-full shadow flex items-center gap-2 transition-all active:scale-95"
        >
          {loading ? 'Menyimpan...' : 'Simpan & Lanjut Upload Dokumen'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
