'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CetakBuktiPage() {
  const [slipData, setSlipData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSlipData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/applicants/print-slip');
      setSlipData(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Gagal memuat bukti pendaftaran. Pastikan Anda telah mengisi formulir.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlipData();
  }, []);

  const formattedPrintDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    if (typeof window === 'undefined') return;

    // Deteksi jika halaman dibuka di dalam iframe (misal ekstensi Mobile Simulator)
    const isInsideIframe = window.self !== window.top;

    if (isInsideIframe) {
      // Buka halaman di jendela/tab baru browser agar dialog cetak dan simpan PDF aktif normal
      const printWin = window.open(window.location.href, '_blank');
      if (printWin) {
        printWin.focus();
        setTimeout(() => {
          try {
            printWin.print();
          } catch {
            // fallback
          }
        }, 500);
        return;
      }
    }

    try {
      window.focus();
      window.print();
    } catch {
      window.open(window.location.href, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">
            Menyiapkan Kartu Bukti Pendaftaran...
          </p>
        </div>
      </div>
    );
  }

  if (error || !slipData) {
    return (
      <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4 my-8">
        <div className="w-11 h-11 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center mx-auto">
          !
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          Kartu Pendaftaran Belum Siap
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">{error}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const biodataRows = [
    {
      label: 'Nomor Registrasi',
      value: slipData.registrationNumber,
      isBold: true,
    },
    {
      label: 'Nama Lengkap',
      value: slipData.applicantName,
      isBold: true,
    },
    {
      label: 'Nomor Induk Kependudukan (NIK)',
      value: slipData.nik,
    },
    {
      label: 'Tempat, Tanggal Lahir',
      value: slipData.birthInfo,
    },
    {
      label: 'Jenis Kelamin',
      value: slipData.gender,
    },
    {
      label: 'Asal Sekolah / Jurusan',
      value: `${slipData.schoolName || '-'} (${slipData.major || '-'})`,
    },
    {
      label: 'Program Studi Pilihan',
      value: slipData.studyProgramName,
      isBold: true,
    },
    {
      label: 'Gelombang / Periode PMB',
      value: slipData.periodName,
    },
    {
      label: 'Status Pendaftaran',
      value: String(slipData.status || '').replace(/_/g, ' '),
      isBold: true,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6 pb-10">
      {/* Action Bar (Tersembunyi saat dicetak) */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
        <Link
          href="/dashboard"
          className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>
        <button
          type="button"
          onClick={handlePrint}
          className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Cetak / Download PDF
        </button>
      </div>

      {/* Lembar Surat Resmi PMB (Full Hitam-Putih + Times New Roman) */}
      <div
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
        className="bg-white text-black p-5 sm:p-10 md:p-12 rounded-xl border border-black/30 shadow-md print:shadow-none print:border-none print:rounded-none print:p-0"
      >
        {/* KOP SURAT RESMI */}
        <div className="border-b-[3px] border-black pb-1 mb-6">
          <div className="border-b border-black pb-4 flex flex-col sm:flex-row print:flex-row items-center text-center sm:text-left print:text-left gap-3.5 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
              <img
                src="/logo-mulia.png"
                alt="Logo Mulia Angkasa Akademi"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex-1 space-y-0.5">
              <h1 className="text-base sm:text-xl print:text-xl font-bold uppercase tracking-wide text-black leading-snug">
                KAMPUS MULIA ANGKASA AKADEMI
              </h1>
              <p className="text-xs sm:text-sm print:text-sm font-bold uppercase tracking-wider text-black">
                PENERIMAAN MAHASISWA BARU (PMB)
              </p>
              <p className="text-[11px] sm:text-xs print:text-xs text-black leading-relaxed pt-0.5">
                Jl. Kesambi No. 92 B,Kota Cirebon, Jawa Barat
                <br className="hidden sm:inline print:inline" />{' '}
                <span className="sm:hidden print:hidden">| </span>
                Email: muliaangkasaakademi@gmail.com
              </p>
            </div>
          </div>
        </div>

        {/* JUDUL SURAT */}
        <div className="text-center my-6 sm:my-7 space-y-1">
          <h2 className="text-sm sm:text-base print:text-base font-bold uppercase underline underline-offset-4 tracking-wide text-black">
            KARTU TANDA BUKTI PENDAFTARAN MAHASISWA BARU
          </h2>
          <p className="text-xs sm:text-sm print:text-sm text-black">
            Nomor Registrasi:{' '}
            <span className="font-bold">{slipData.registrationNumber}</span>
          </p>
        </div>

        {/* PEMBUKA SINGKAT */}
        <p className="text-xs sm:text-sm print:text-sm text-black leading-relaxed mb-5 text-justify">
          Petugas Penerimaan Mahasiswa Baru (PMB) Kampus Mulia Angkasa Akademi menerangkan bahwa calon mahasiswa dengan identitas di bawah ini telah terdaftar pada sistem seleksi penerimaan mahasiswa baru:
        </p>

        {/* DATA PENDAFTAR & KOTAK PASFOTO */}
        <div className="flex flex-col md:flex-row print:flex-row items-start justify-between gap-6 sm:gap-8">
          {/* Tabel Biodata Formal */}
          <div className="w-full flex-1 border-t border-black">
            {biodataRows.map((row, index) => (
              <div
                key={index}
                className="py-2.5 sm:py-2 border-b border-black/40 flex flex-col sm:grid sm:grid-cols-12 print:grid print:grid-cols-12 gap-0.5 sm:gap-2 text-xs sm:text-sm print:text-sm text-black"
              >
                <span className="sm:col-span-5 print:col-span-5 font-bold sm:font-normal print:font-normal text-black">
                  {row.label}
                </span>
                <span className="hidden sm:inline print:inline sm:col-span-1 print:col-span-1 text-center text-black">
                  :
                </span>
                <span
                  className={`sm:col-span-6 print:col-span-6 break-words text-black ${row.isBold ? 'font-bold' : 'font-normal'
                    }`}
                >
                  {row.value || '-'}
                </span>
              </div>
            ))}
          </div>

          {/* Kotak Pasfoto 3x4 */}
          <div className="w-full md:w-36 print:w-36 flex flex-col items-center shrink-0 pt-1">
            <div className="w-28 h-36 sm:w-32 sm:h-40 border border-black bg-white flex flex-col items-center justify-center text-center p-2 text-black">
              <span className="text-xs font-bold uppercase tracking-wider">
                PASFOTO
              </span>
              <span className="text-xs mt-0.5">3 × 4 cm</span>
            </div>
            <p className="text-[10px] text-center text-black mt-2 leading-tight">
              Tempelkan pasfoto terbaru saat verifikasi fisik daftar ulang
            </p>
          </div>
        </div>

        {/* CATATAN & KOLOM PENGESAHAN */}
        <div className="mt-8 sm:mt-10 pt-5 border-t border-black flex flex-col sm:flex-row print:flex-row justify-between items-start sm:items-end print:items-end gap-8 text-xs sm:text-sm print:text-sm text-black">
          <div className="max-w-sm space-y-1.5">
            <p className="font-bold underline text-black">Catatan Penting:</p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] sm:text-xs print:text-xs text-black leading-relaxed">
              <li>
                Kartu ini merupakan bukti sah pendaftaran PMB Kampus Mulia Angkasa Akademi.
              </li>
              <li>
                Wajib dicetak dan dibawa saat proses daftar ulang di kampus.
              </li>
            </ol>
          </div>

          <div className="w-full sm:w-auto print:w-auto text-center sm:text-center print:text-center self-end">
            <p className="text-xs sm:text-sm print:text-sm text-black">
              Cirebon, {formattedPrintDate}
            </p>
            <p className="text-xs sm:text-sm print:text-sm font-bold text-black mt-0.5">
              Di isi oleh petugas PMB,
            </p>
            <div className="h-16 sm:h-20 print:h-20" />
            <p className="text-xs sm:text-sm print:text-sm font-bold underline text-black">
              ( ........................................ )
            </p>
            <p className="text-[11px] text-black mt-0.5">
              Ttd &amp; Stempel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
