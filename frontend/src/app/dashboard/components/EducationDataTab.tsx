'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EducationFormData } from '../types';

interface EducationDataTabProps {
  educationForm: EducationFormData;
  setEducationForm: React.Dispatch<React.SetStateAction<EducationFormData>>;
  loading: boolean;
  onPrevious: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function EducationDataTab({
  educationForm,
  setEducationForm,
  loading,
  onPrevious,
  onSubmit,
}: EducationDataTabProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
      <h3 className="text-base sm:text-lg font-bold text-slate-900 border-b pb-3">
        Isi Data Pendidikan Terakhir
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Nama Asal Sekolah (SMA / SMK / MA) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="SMKN 1 Bekasi"
            value={educationForm.schoolName}
            onChange={(e) =>
              setEducationForm({
                ...educationForm,
                schoolName: e.target.value,
              })
            }
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            NPSN Sekolah <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            required
            minLength={8}
            maxLength={8}
            pattern="\d{8}"
            title="NPSN harus terdiri dari 8 digit angka"
            placeholder="20254123"
            value={educationForm.npsn}
            onChange={(e) =>
              setEducationForm({
                ...educationForm,
                npsn: e.target.value.replace(/\D/g, '').slice(0, 8),
              })
            }
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Jurusan di Sekolah <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="IPA / IPS / Rekayasa Perangkat Lunak / Otomotif"
            value={educationForm.major}
            onChange={(e) =>
              setEducationForm({
                ...educationForm,
                major: e.target.value,
              })
            }
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Tahun Lulus <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            required
            min={1995}
            max={2030}
            value={educationForm.graduationYear}
            onChange={(e) =>
              setEducationForm({
                ...educationForm,
                graduationYear: parseInt(e.target.value) || 2027,
              })
            }
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      <div className="pt-4 border-t flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={loading}
          className="w-full sm:w-auto justify-center px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-full flex items-center gap-2 transition-all active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto justify-center px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm rounded-full shadow flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
        >
          {loading ? 'Menyimpan...' : 'Lanjut Pilihan Prodi'}
          <ChevronRight className="w-4 h-4 shrink-0" />
        </button>
      </div>
    </form>
  );
}