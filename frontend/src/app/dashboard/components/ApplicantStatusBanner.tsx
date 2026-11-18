'use client';

import React from 'react';
import Link from 'next/link';
import { Printer } from 'lucide-react';
import { StatusStep } from '../types';

interface ApplicantStatusBannerProps {
  fullName?: string;
  registrationNumber?: string;
  currentStatus: string;
  statusSteps: StatusStep[];
  getStatusIndex: (st: string) => number;
}

export default function ApplicantStatusBanner({
  fullName,
  registrationNumber,
  currentStatus,
  statusSteps,
  getStatusIndex,
}: ApplicantStatusBannerProps) {
  const currentIdx = getStatusIndex(currentStatus);

  return (
    <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
            STATUS PENDAFTARAN TERKINI
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {fullName || 'Calon Mahasiswa'}
          </h1>

          <p className="text-xs text-slate-300 mt-1 font-mono">
            Nomor Pendaftaran:{' '}
            <span className="text-amber-300 font-bold">
              {registrationNumber || 'PMB-2027-PENDING'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow ${
              currentStatus === 'DITERIMA' || currentStatus === 'LULUS_SELEKSI'
                ? 'bg-emerald-500 text-slate-950'
                : currentStatus === 'DIVERIFIKASI'
                ? 'bg-sky-500 text-white'
                : currentStatus === 'MENUNGGU_VERIFIKASI'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            {currentStatus.replace(/_/g, ' ')}
          </span>

          <Link
            href="/dashboard/cetak-bukti"
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            Cetak Bukti PMB
          </Link>
        </div>
      </div>

      {/* STEPPER STATUS */}
      <div className="mt-8 pt-6 border-t border-slate-800">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {statusSteps.map((step, idx) => {
            const isCompleted = idx <= currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div
                key={step.key}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-sky-600 border-sky-400 text-white font-bold ring-2 ring-sky-400/50'
                    : isCompleted
                    ? 'bg-slate-800 border-slate-700 text-sky-400 font-semibold'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500 text-xs'
                }`}
              >
                <div className="text-[10px] text-slate-400 uppercase font-mono">
                  Step 0{idx + 1}
                </div>
                <div className="text-xs truncate mt-0.5">
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
