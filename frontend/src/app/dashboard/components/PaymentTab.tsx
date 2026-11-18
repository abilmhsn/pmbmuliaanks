'use client';

import React from 'react';
import { CreditCard, AlertCircle, ChevronLeft } from 'lucide-react';
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
  const hasExistingPayments = payments && payments.length > 0;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900 border-b pb-3">
        Pembayaran & Bukti Transfer
      </h3>

      {hasExistingPayments && !isReuploading ? (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-300 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500 text-slate-950 rounded-xl font-bold flex-shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-amber-900 text-sm">
                  ⚠️ Anda Sudah Mengunggah Bukti Pembayaran
                </h4>

                <p className="text-xs text-amber-800 leading-relaxed">
                  Bukti transfer Anda telah tersimpan dan sedang diperiksa panitia. Jika Anda salah mengunggah file atau ingin memperbarui bukti transfer, silakan klik tombol di sebelah kanan.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsReuploading(true)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-all whitespace-nowrap shadow-sm self-end sm:self-center active:scale-95"
            >
              Salah Upload? Unggah Ulang
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full max-w-full min-w-0">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
              Riwayat Bukti Pembayaran Anda:
            </div>

            <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch]">
              <table className="w-max min-w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 whitespace-nowrap">Tipe Pembayaran</th>
                    <th className="p-3 whitespace-nowrap">Nominal</th>
                    <th className="p-3 whitespace-nowrap">Bukti File</th>
                    <th className="p-3 whitespace-nowrap">Status Verifikasi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {payments.map((pay) => (
                    <tr key={pay.id}>
                      <td className="p-3 font-bold whitespace-nowrap">
                        {pay.paymentType || 'Biaya Pendaftaran PMB'}
                      </td>

                      <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        Rp {pay.amount?.toLocaleString('id-ID')}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <a
                          href={getFullDocumentUrl(pay.proofUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-600 hover:underline font-semibold"
                        >
                          Lihat Bukti Transfer
                        </a>
                      </td>

                      <td className="p-3 whitespace-nowrap">
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
            <div className="flex justify-between items-center p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-800 text-xs font-semibold">
              <span>
                ℹ️ Anda sedang dalam mode memperbarui / mengunggah ulang bukti transfer.
              </span>

              <button
                type="button"
                onClick={() => setIsReuploading(false)}
                className="text-slate-500 hover:text-slate-800 underline font-bold"
              >
                Batal
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4">
              <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                Rekening Pembayaran Resmi Kampus:
              </h4>

              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="text-xs text-slate-400">
                  Bank Transfer:
                </div>

                <div className="text-lg font-bold text-white uppercase">
                  {bankSettings.bankName}
                </div>

                <div className="text-2xl font-mono font-extrabold text-amber-300">
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
                . Setelah melakukan pembayaran, unggah bukti transfer pada form di sebelah kanan.
              </div>
            </div>

            <form
              onSubmit={onUpload}
              className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4"
            >
              <h4 className="font-bold text-sm text-slate-900">
                {isReuploading
                  ? 'Unggah Ulang Bukti Baru:'
                  : 'Upload Bukti Transfer:'}
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  File Bukti Transfer (Foto/PDF)
                </label>

                <input
                  id="payment-file-input"
                  type="file"
                  required
                  accept="image/*,application/pdf"
                  onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-sky-500"
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

      <div className="pt-4 border-t flex justify-start">
        <button
          type="button"
          onClick={onPrevious}
          disabled={loading}
          className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-full flex items-center gap-2 transition-all active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Dokumen
        </button>
      </div>
    </div>
  );
}
