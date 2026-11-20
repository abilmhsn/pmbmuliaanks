'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  AlertCircle,
  ChevronLeft,
  Eye,
  X,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { BankSettingsData } from '../types';

interface PaymentItem {
  id: string;
  paymentType?: string;
  amount: number;
  proofUrl?: string;
  status?: string;
}

interface PaymentTabProps {
  payments: PaymentItem[];
  bankSettings: BankSettingsData;
  paymentAmount: string;
  setPaymentAmount: (val: string) => void;
  setPaymentFile: (file: File | null) => void;
  isReuploading: boolean;
  setIsReuploading: (val: boolean) => void;
  loading: boolean;
  getFullDocumentUrl: (filePath?: string) => string;
  onUpload: (e: React.FormEvent) => void;
  onPrevious: () => void;
}

export default function PaymentTab({
  payments,
  bankSettings,
  paymentAmount,
  setPaymentAmount,
  setPaymentFile,
  isReuploading,
  setIsReuploading,
  loading,
  getFullDocumentUrl,
  onUpload,
  onPrevious,
}: PaymentTabProps) {
  const [previewPayment, setPreviewPayment] = useState<PaymentItem | null>(null);

  const hasExistingPayments = payments && payments.length > 0;
  const previewUrl = previewPayment ? getFullDocumentUrl(previewPayment.proofUrl) : '';
  const isPdf = previewUrl.toLowerCase().includes('.pdf');

  return (
    <div className="space-y-5 sm:space-y-6">
      <h3 className="text-base sm:text-lg font-bold text-slate-900 border-b pb-3">
        Pembayaran & Bukti Transfer
      </h3>

      {hasExistingPayments && !isReuploading ? (
        <div className="space-y-5 sm:space-y-6">
          {/* Card Peringatan Sudah Upload */}
          <div className="bg-amber-50 border border-amber-300/90 p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 shadow-sm">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-amber-500 text-slate-950 rounded-xl font-bold shrink-0">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-amber-900 text-sm leading-snug">
                  Anda Sudah Mengunggah Bukti Pembayaran
                </h4>

                <p className="text-xs text-amber-800 leading-relaxed">
                  Bukti transfer Anda telah tersimpan dan sedang diperiksa panitia. Jika salah mengunggah file atau ingin memperbarui bukti transfer, klik tombol di bawah ini.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsReuploading(true)}
              className="w-full sm:w-auto justify-center px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-all whitespace-nowrap shadow-sm shrink-0 active:scale-95"
            >
              Salah Upload? Unggah Ulang
            </button>
          </div>

          {/* Riwayat Bukti Pembayaran */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
              Riwayat Bukti Pembayaran Anda:
            </div>

            {/* Tampilan Card Rapi Khusus Mobile */}
            <div className="divide-y divide-slate-200 sm:hidden">
              {payments.map((pay) => (
                <div key={pay.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="font-bold text-xs text-slate-900 block">
                        {pay.paymentType || 'Biaya Pendaftaran PMB'}
                      </span>
                      <span className="font-mono font-extrabold text-sm text-slate-900 block">
                        Rp {pay.amount?.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {pay.status === 'VERIFIED' ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold shrink-0">
                        Terverifikasi
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold shrink-0">
                        Menunggu Verifikasi
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewPayment(pay)}
                    className="w-full justify-center inline-flex items-center gap-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-semibold transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Lihat Bukti Transfer
                  </button>
                </div>
              ))}
            </div>

            {/* Tampilan Tabel Khusus Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Tipe Pembayaran</th>
                    <th className="p-3.5">Nominal</th>
                    <th className="p-3.5">Bukti File</th>
                    <th className="p-3.5 text-right">Status Verifikasi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold whitespace-nowrap">
                        {pay.paymentType || 'Biaya Pendaftaran PMB'}
                      </td>

                      <td className="p-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                        Rp {pay.amount?.toLocaleString('id-ID')}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setPreviewPayment(pay)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg font-semibold transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Lihat Bukti Transfer
                        </button>
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        {pay.status === 'VERIFIED' ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                            Terverifikasi
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold">
                            Menunggu Verifikasi Admin
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {isReuploading && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-sky-800 text-xs font-semibold">
              <span>
                Anda sedang dalam mode memperbarui / mengunggah ulang bukti transfer.
              </span>

              <button
                type="button"
                onClick={() => setIsReuploading(false)}
                className="text-slate-600 hover:text-slate-900 underline font-bold shrink-0"
              >
                Batal
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl space-y-4">
              <h4 className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider">
                Rekening Pembayaran Resmi Kampus:
              </h4>

              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-1.5">
                <div className="text-xs text-slate-400">
                  Bank Transfer:
                </div>

                <div className="text-base sm:text-lg font-bold text-white uppercase">
                  {bankSettings.bankName}
                </div>

                <div className="text-xl sm:text-2xl font-mono font-extrabold text-amber-300 break-all">
                  {bankSettings.accountNumber}
                </div>

                <div className="text-xs text-slate-300">
                  a.n {bankSettings.accountHolder}
                </div>
              </div>

              <div className="text-xs text-slate-400 leading-relaxed">
                Nominal Biaya Pendaftaran:{' '}
                <span className="font-bold text-white">
                  Rp {Number(bankSettings?.registrationFee || 0).toLocaleString('id-ID')}
                </span>
                . Setelah melakukan pembayaran, unggah bukti transfer pada form di samping.
              </div>
            </div>

            <form
              onSubmit={onUpload}
              className="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4"
            >
              <h4 className="font-bold text-sm text-slate-900">
                {isReuploading
                  ? 'Unggah Ulang Bukti Baru:'
                  : 'Upload Bukti Transfer:'}
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Jumlah Transfer (Rp)
                </label>

                <input
                  type="number"
                  required
                  min={1}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-semibold focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  File Bukti Transfer (Foto/PDF)
                </label>

                <input
                  id="payment-file-input"
                  type="file"
                  required
                  accept="image/*,application/pdf"
                  onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-sky-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 file:cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-full shadow flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                {loading
                  ? 'Mengirim...'
                  : isReuploading
                    ? 'Simpan Bukti Pembayaran Baru'
                    : 'Kirim Bukti Pembayaran'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tombol Navigasi Bawah */}
      <div className="pt-4 border-t flex justify-start">
        <button
          type="button"
          onClick={onPrevious}
          disabled={loading}
          className="w-full sm:w-auto justify-center px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-full flex items-center gap-2 transition-all active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Dokumen
        </button>
      </div>

      {/* MODAL POPUP PREVIEW BUKTI TRANSFER */}
      {previewPayment && (
        <div
          onClick={() => setPreviewPayment(null)}
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header Modal */}
            <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-amber-400/15 text-amber-400 rounded-xl border border-amber-400/20 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 truncate">
                      {previewPayment.paymentType || 'Biaya Pendaftaran PMB'}
                    </span>
                    {previewPayment.status === 'VERIFIED' ? (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                        Terverifikasi
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-bold">
                        Menunggu Verifikasi
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-slate-300 mt-0.5">
                    Nominal: Rp {previewPayment.amount?.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewPayment(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors shrink-0"
                title="Tutup Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Area Tampilan Bukti Transfer */}
            <div className="p-4 sm:p-6 bg-slate-100 flex-1 overflow-auto flex items-center justify-center">
              {isPdf ? (
                <iframe
                  src={previewUrl}
                  title="Bukti Transfer PMB"
                  className="w-full h-[65vh] rounded-xl border border-slate-300 bg-white"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Bukti Transfer PMB"
                  className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-md border border-slate-200 bg-white"
                />
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-4 sm:px-5 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Buka ukuran penuh
              </a>

              <button
                type="button"
                onClick={() => setPreviewPayment(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all active:scale-95"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}