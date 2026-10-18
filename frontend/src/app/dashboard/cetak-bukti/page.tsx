'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plane, Printer, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function CetakBuktiPage() {
  const [slipData, setSlipData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSlipData();
  }, []);

  const fetchSlipData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/applicants/print-slip');
      setSlipData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat bukti pendaftaran. Pastikan Anda telah mengisi formulir.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-700">Menyiapkan Kartu Bukti Pendaftaran...</p>
        </div>
      </div>
    );
  }

  if (error || !slipData) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow text-center space-y-4 my-10">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          !
        </div>
        <h2 className="text-lg font-bold text-slate-900">Kartu Pendaftaran Belum Siap</h2>
        <p className="text-xs text-slate-600">{error}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white font-bold text-xs rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      {/* Action Bar (Hidden on print) */}
      <div className="print:hidden flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <Link
          href="/dashboard"
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
        <button
          onClick={() => window.print()}
          className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-full shadow flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> Cetak / Download PDF
        </button>
      </div>

      {/* Printable Card Area */}
      <div className="bg-white p-8 rounded-2xl border border-slate-300 shadow-lg print:shadow-none print:border-none print:p-0">

        {/* Header */}
        <div className="border-b-4 border-slate-900 pb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-17 h-17 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
              <img
                src="/logo-mulia.png"
                alt="Logo Mulia Angkasa"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight">
                KAMPUS MULIA ANGKASA AKADEMIK
              </h1>

              <p className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                PANITIA PENERIMAAN MAHASISWA BARU (PMB)
              </p>
              <p className="text-[11px] text-slate-500">
                Jl. Kesambi No.92, Kesambi, Kec. Kesambi, Kota Cirebon | Email: muliaangkasaakademi@gmail.com
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold rounded-lg border border-amber-300 block">
              OFFICIAL SLIP
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">T.A 2026/2027</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-6">
          <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-wide">
            KARTU TANDA BUKTI PENDAFTARAN PMB
          </h2>
          <p className="text-xs text-slate-500">Nomor Registrasi: <span className="font-mono font-bold text-slate-900">{slipData.registrationNumber}</span></p>
        </div>

        {/* Details Table */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Photo Placeholder / QR Box */}
          <div className="flex flex-col items-center justify-center space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="w-32 h-40 bg-slate-200 border-2 border-dashed border-slate-400 rounded-xl flex items-center justify-center text-slate-500 text-xs font-bold">
              PASFOTO 3x4
            </div>
            <div className="text-center font-mono text-[11px] text-slate-600">
              <span className="block font-bold">QR VERIFICATION</span>
              <span className="text-[9px] text-slate-400">Validasi Panitia PMB</span>
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-2 space-y-3 text-xs text-slate-800">
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="font-bold text-slate-500">Nama Lengkap</span>
              <span className="col-span-2 font-bold text-sm text-slate-900">{slipData.applicantName}</span>
            </div>

            <div className="grid grid-cols-3 border-b pb-2">
              <span className="font-bold text-slate-500">NIK</span>
              <span className="col-span-2 font-mono font-semibold">{slipData.nik}</span>
            </div>

            <div className="grid grid-cols-3 border-b pb-2">
              <span className="font-bold text-slate-500">Tempat, Tgl Lahir</span>
              <span className="col-span-2">{slipData.birthInfo}</span>
            </div>

            <div className="grid grid-cols-3 border-b pb-2">
              <span className="font-bold text-slate-500">Jenis Kelamin</span>
              <span className="col-span-2">{slipData.gender}</span>
            </div>

            <div className="grid grid-cols-3 border-b pb-2">
              <span className="font-bold text-slate-500">Asal Sekolah</span>
              <span className="col-span-2 font-semibold">{slipData.schoolName} ({slipData.major})</span>
            </div>

            <div className="grid grid-cols-3 border-b pb-2">
              <span className="font-bold text-slate-500">Pilihan Prodi</span>
              <span className="col-span-2 font-extrabold text-sky-700">{slipData.studyProgramName}</span>
            </div>

            <div className="grid grid-cols-3 border-b pb-2">
              <span className="font-bold text-slate-500">Periode PMB</span>
              <span className="col-span-2">{slipData.periodName}</span>
            </div>

            <div className="grid grid-cols-3 border-b pb-2">
              <span className="font-bold text-slate-500">Status Pendaftaran</span>
              <span className="col-span-2">
                <span className="px-2.5 py-1 bg-sky-100 text-sky-800 font-extrabold rounded-md text-[11px]">
                  {slipData.status}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer & Signature */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-600">
          <div>
            <p className="font-semibold text-slate-900">Catatan Panitia:</p>
            <p className="text-[11px] text-slate-500 max-w-sm">
              Kartu ini merupakan bukti sah pendaftaran PMB Kampus Mulia Angkasa. Simpan bukti ini untuk proses seleksi dan daftar ulang.
            </p>
          </div>
          <div className="text-center font-semibold">
            <p className="mb-12">Ketua Panitia PMB,</p>
            <p className="font-bold text-slate-900 underline">( Ttd & Stempel Panitia )</p>
          </div>
        </div>
      </div>
    </div>
  );
}
