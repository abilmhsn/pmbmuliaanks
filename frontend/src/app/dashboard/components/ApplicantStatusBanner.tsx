'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import api from '@/lib/api';
import {
  Printer,
  Lock,
  Award,
  CheckCircle2,
  ArrowRight,
  X,
  Info,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { StatusStep } from '../types';

interface ApplicantStatusBannerProps {
  fullName?: string;
  registrationNumber?: string;
  currentStatus: string;
  statusSteps: StatusStep[];
  getStatusIndex: (st: string) => number;
  helpDeskPhone?: string;
}

const PRINT_UNLOCKED_STATUSES = ['LULUS_SELEKSI', 'DAFTAR_ULANG', 'DITERIMA'];

export default function ApplicantStatusBanner({
  fullName,
  registrationNumber,
  currentStatus,
  statusSteps,
  getStatusIndex,
  helpDeskPhone,
}: ApplicantStatusBannerProps) {
  const currentIdx = getStatusIndex(currentStatus);
  const canPrintProof = PRINT_UNLOCKED_STATUSES.includes(currentStatus);
  const [showPassedModal, setShowPassedModal] = useState(false);
  const [showAcceptedModal, setShowAcceptedModal] = useState(false);
  const [waNumber, setWaNumber] = useState<string>(helpDeskPhone || '');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ambil nomor WhatsApp Help Desk dari pengaturan publik jika tidak dikirim lewat props
  useEffect(() => {
    if (helpDeskPhone) {
      setWaNumber(helpDeskPhone);
      return;
    }

    const loadHelpDeskPhone = async () => {
      try {
        const res = await api.get('/super-admin/public/settings');
        if (res.data?.HELP_DESK_PHONE) {
          setWaNumber(res.data.HELP_DESK_PHONE);
        }
      } catch {
        // Abaikan jika gagal memuat, fallback nomor default tetap tersedia
      }
    };

    loadHelpDeskPhone();
  }, [helpDeskPhone]);

  // Tampilkan pop-up otomatis 1x saat status mencapai LULUS_SELEKSI atau DITERIMA
  useEffect(() => {
    const regKey = registrationNumber || 'default';

    if (currentStatus === 'LULUS_SELEKSI') {
      const storageKey = `pmb_passed_modal_${regKey}`;
      if (!localStorage.getItem(storageKey)) {
        setShowPassedModal(true);
        localStorage.setItem(storageKey, 'true');
      }
    } else if (currentStatus === 'DITERIMA') {
      const storageKey = `pmb_accepted_modal_${regKey}`;
      if (!localStorage.getItem(storageKey)) {
        setShowAcceptedModal(true);
        localStorage.setItem(storageKey, 'true');
      }
    }
  }, [currentStatus, registrationNumber]);

  const formatWhatsappUrl = (rawPhone: string) => {
    const digits = (rawPhone || '').replace(/\D/g, '');
    let normalized = digits;

    if (normalized.startsWith('0')) {
      normalized = '62' + normalized.slice(1);
    } else if (!normalized.startsWith('62') && normalized.length > 0) {
      normalized = '62' + normalized;
    }

    // Fallback jika admin belum mengisi HELP_DESK_PHONE di pengaturan
    if (!normalized) {
      normalized = '6281200000000';
    }

    const message = encodeURIComponent(
      `Halo Admin PMB Mulia Angkasa Akademi, saya *${fullName || 'Calon Mahasiswa'}* (No. Pendaftaran: *${registrationNumber || '-'}*) sudah dinyatakan *DITERIMA* dan menyelesaikan daftar ulang. Mohon informasi selanjutnya terkait grup mahasiswa baru dan jadwal perkuliahan. Terima kasih.`
    );

    return `https://wa.me/${normalized}?text=${message}`;
  };

  const getStatusGuidance = () => {
    switch (currentStatus) {
      case 'BELUM_LENGKAP':
        return 'Lengkapi seluruh formulir pendaftaran (Data Diri, Pendidikan, Prodi, minimal 2 Dokumen) lalu unggah bukti Uang Muka (DP).';
      case 'MENUNGGU_VERIFIKASI':
        return 'Berkas dan/atau bukti pembayaran Anda sedang dalam antrean pengecekan oleh panitia PMB.';
      case 'DIVERIFIKASI':
        return 'Berkas pendaftaran terverifikasi. Segera selesaikan pembayaran Uang Muka (DP) pada Tab 5 agar status diproses ke Lulus Seleksi.';
      case 'LULUS_SELEKSI':
        return 'Selamat! Anda dinyatakan Lulus Seleksi. Silakan cetak Bukti PMB dan bawa ke kampus Mulia Angkasa Akademi untuk proses Daftar Ulang.';
      case 'DAFTAR_ULANG':
        return 'Anda berada pada tahap Daftar Ulang. Serahkan Bukti PMB beserta kelengkapan administrasi ke kampus Mulia Angkasa Akademi.';
      case 'DITERIMA':
        return 'Selamat bergabung! Proses pendaftaran dan daftar ulang Anda telah selesai dan resmi diterima sebagai mahasiswa Mulia Angkasa Akademi.';
      default:
        return '';
    }
  };

  const guidanceText = getStatusGuidance();

  // POP-UP 1: LULUS SELEKSI
  const passedModal =
    mounted && showPassedModal
      ? createPortal(
        <div
          onClick={() => setShowPassedModal(false)}
          className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-sm overflow-y-auto"
        >
          <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden my-auto"
            >
              {/* Header Pop-Up */}
              <div className="bg-slate-900 text-white p-5 sm:p-6 relative overflow-hidden text-center">
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassedModal(false)}
                  className="absolute top-3.5 right-3.5 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  aria-label="Tutup pop-up"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center mb-3">
                  <Award className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Lulus Seleksi PMB
                </span>

                <h3 className="text-lg sm:text-xl font-extrabold text-white px-4">
                  Selamat, {fullName || 'Calon Mahasiswa'}!
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-1 font-mono">
                  No. Pendaftaran: {registrationNumber || '-'}
                </p>
              </div>

              {/* Isi Panduan Daftar Ulang */}
              <div className="p-5 sm:p-6 space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-center">
                  Pembayaran uang muka pendaftaran Anda telah diverifikasi. Silakan lanjutkan ke tahap{' '}
                  <strong className="text-slate-900">Daftar Ulang</strong> dengan mencetak{' '}
                  <strong className="text-slate-900">Bukti PMB</strong> dan menyerahkannya langsung ke kampus{' '}
                  <strong className="text-slate-900">Mulia Angkasa Akademi</strong>.
                </p>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-1.5">
                  <div className="font-bold">Langkah Selanjutnya:</div>
                  <ol className="list-decimal list-inside space-y-1 text-amber-800 leading-relaxed">
                    <li>Cetak atau simpan PDF Bukti Pendaftaran PMB.</li>
                    <li>Datang ke kampus Mulia Angkasa Akademi untuk Daftar Ulang.</li>
                    <li>
                      Admin akan mengubah status menjadi <strong>Diterima</strong> setelah proses daftar ulang selesai.
                    </li>
                  </ol>
                </div>

                <div className="pt-1 flex flex-col-reverse sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowPassedModal(false)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Nanti Saja
                  </button>

                  <Link
                    href="/dashboard/cetak-bukti"
                    onClick={() => setShowPassedModal(false)}
                    className="flex-1 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Printer className="w-4 h-4 shrink-0" />
                    <span>Cetak Bukti PMB Sekarang</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
      : null;

  // POP-UP 2: RESMI DITERIMA & ARAHAN LANJUTAN KE WA AKADEMIK
  const acceptedModal =
    mounted && showAcceptedModal
      ? createPortal(
        <div
          onClick={() => setShowAcceptedModal(false)}
          className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-sm overflow-y-auto"
        >
          <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden my-auto"
            >
              {/* Header Pop-Up */}
              <div className="bg-slate-900 text-white p-5 sm:p-6 relative overflow-hidden text-center">
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/25 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

                <button
                  type="button"
                  onClick={() => setShowAcceptedModal(false)}
                  className="absolute top-3.5 right-3.5 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  aria-label="Tutup pop-up"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center mb-3">
                  <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Resmi Diterima
                </span>

                <h3 className="text-lg sm:text-xl font-extrabold text-white px-4">
                  Selamat Bergabung, {fullName || 'Mahasiswa Baru'}!
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-1 font-mono">
                  No. Pendaftaran: {registrationNumber || '-'}
                </p>
              </div>

              {/* Isi Informasi Setelah Diterima */}
              <div className="p-5 sm:p-6 space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-center">
                  Terima kasih telah menyelesaikan seluruh rangkaian pendaftaran dan daftar ulang. Anda kini resmi tercatat sebagai calon mahasiswa{' '}
                  <strong className="text-slate-900">Mulia Angkasa Akademi</strong>.
                </p>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-xs text-emerald-950 space-y-1.5">
                  <div className="font-bold text-emerald-900">
                    Informasi &amp; Arahan Selanjutnya:
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-emerald-900 leading-relaxed">
                    <li>
                      <strong>Konfirmasi ke WhatsApp Akademik</strong> melalui tombol di bawah untuk bergabung ke grup informasi Mahasiswa Baru.
                    </li>
                    <li>
                      Dapatkan informasi jadwal <strong>Orientasi Kampus (PKKMB)</strong>, pengukuran seragam, serta kalender awal perkuliahan dari admin akademik.
                    </li>
                    <li>
                      Simpan atau cetak <strong>Bukti PMB</strong> sebagai arsip resmi pendaftaran Anda.
                    </li>
                  </ol>
                </div>

                <div className="pt-1 space-y-2.5">
                  <a
                    href={formatWhatsappUrl(waNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>Hubungi WhatsApp Informasi Akademik</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </a>

                  <div className="flex flex-col-reverse sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAcceptedModal(false)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Tutup
                    </button>

                    <Link
                      href="/dashboard/cetak-bukti"
                      onClick={() => setShowAcceptedModal(false)}
                      className="flex-1 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <Printer className="w-4 h-4 shrink-0" />
                      <span>Cetak / Simpan Bukti PMB</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
      : null;

  return (
    <>
      <div className="bg-slate-900 text-white p-5 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 sm:gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
              STATUS PENDAFTARAN TERKINI
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white break-words">
              {fullName || 'Calon Mahasiswa'}
            </h1>

            <p className="text-xs text-slate-300 mt-1 font-mono">
              Nomor Pendaftaran:{' '}
              <span className="text-amber-300 font-bold">
                {registrationNumber || 'PMB-2027-PENDING'}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            <span
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow ${currentStatus === 'DITERIMA' || currentStatus === 'LULUS_SELEKSI'
                  ? 'bg-emerald-500 text-slate-950'
                  : currentStatus === 'DAFTAR_ULANG'
                    ? 'bg-amber-400 text-slate-950'
                    : currentStatus === 'DIVERIFIKASI'
                      ? 'bg-sky-500 text-white'
                      : currentStatus === 'MENUNGGU_VERIFIKASI'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-700 text-slate-300'
                }`}
            >
              {currentStatus.replace(/_/g, ' ')}
            </span>

            {canPrintProof ? (
              <Link
                href="/dashboard/cetak-bukti"
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                Cetak Bukti PMB
              </Link>
            ) : (
              <button
                type="button"
                disabled
                title="Tersedia setelah pembayaran Uang Muka diverifikasi dan status Lulus Seleksi"
                className="px-4 py-2 bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-not-allowed opacity-80"
              >
                <Lock className="w-3.5 h-3.5" />
                Cetak Bukti PMB
              </button>
            )}
          </div>
        </div>

        {/* STEPPER STATUS */}
        <div className="relative z-10 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-800 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {statusSteps.map((step, idx) => {
              const isCompleted = idx <= currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div
                  key={step.key}
                  className={`p-3 rounded-xl border text-center transition-all ${isCurrent
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

          {/* Info Panduan Langkah Saat Ini */}
          {guidanceText && (
            <div className="p-3.5 sm:px-4 sm:py-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-200">
              <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                <span className="leading-relaxed">{guidanceText}</span>
              </div>

              {currentStatus === 'LULUS_SELEKSI' && (
                <button
                  type="button"
                  onClick={() => setShowPassedModal(true)}
                  className="w-full sm:w-auto text-center sm:text-right py-2 px-3 sm:p-0 rounded-lg bg-amber-400/10 sm:bg-transparent border border-amber-400/30 sm:border-0 text-amber-400 hover:text-amber-300 font-bold sm:underline shrink-0 cursor-pointer transition-colors"
                >
                  Lihat Info Kelulusan
                </button>
              )}

              {currentStatus === 'DITERIMA' && (
                <button
                  type="button"
                  onClick={() => setShowAcceptedModal(true)}
                  className="w-full sm:w-auto text-center sm:text-right py-2 px-3 sm:p-0 rounded-lg bg-emerald-400/10 sm:bg-transparent border border-emerald-400/30 sm:border-0 text-emerald-400 hover:text-emerald-300 font-bold sm:underline shrink-0 cursor-pointer transition-colors"
                >
                  Lihat Info Penerimaan
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {passedModal}
      {acceptedModal}
    </>
  );
}