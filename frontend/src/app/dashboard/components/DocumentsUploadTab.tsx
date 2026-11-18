'use client';

import React from 'react';
import { Upload, ChevronLeft, ChevronRight } from 'lucide-react';

interface DocumentItem {
  id: string;
  type: string;
  fileName: string;
  fileUrl?: string;
  isVerified?: boolean;
}

interface DocumentsUploadTabProps {
  requiredDocuments: string[];
  savedDocuments: DocumentItem[];
  selectedDocType: string;
  setSelectedDocType: (val: string) => void;
  setDocFile: (file: File | null) => void;
  loading: boolean;
  isDocumentsCompleted: boolean;
  getFullDocumentUrl: (filePath?: string) => string;
  onUpload: (e: React.FormEvent) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function DocumentsUploadTab({
  requiredDocuments,
  savedDocuments,
  selectedDocType,
  setSelectedDocType,
  setDocFile,
  loading,
  isDocumentsCompleted,
  getFullDocumentUrl,
  onUpload,
  onPrevious,
  onNext,
}: DocumentsUploadTabProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900 border-b pb-3">
        Unggah Dokumen Berkas PMB
      </h3>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800">
        Lengkapi seluruh dokumen wajib berikut untuk membuka tahap pembayaran:
        <div className="flex flex-wrap gap-2 mt-2">
          {requiredDocuments.map((type) => {
            const uploaded = savedDocuments.some(
              (doc) => doc.type === type
            );

            return (
              <span
                key={type}
                className={`px-3 py-1 rounded-full font-bold ${
                  uploaded
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-white border border-blue-200 text-slate-600'
                }`}
              >
                {uploaded ? '✓ ' : '○ '}
                {type}
              </span>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={onUpload}
        className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Jenis Dokumen
            </label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500"
            >
              <option value="FOTO">Pasfoto Berwarna (Latar Merah)</option>
              <option value="KTP">KTP / Kartu Pelajar / KK</option>
              <option value="IJAZAH">Ijazah / SKL Sementara</option>
              <option value="TRANSKRIP">Transkrip Nilai / Rapor</option>
              <option value="LAINNYA">Dokumen Pendukung Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pilih File (JPG, PNG, PDF max 5MB)
            </label>
            <input
              id="document-file-input"
              type="file"
              required
              accept="image/*,application/pdf"
              onChange={(e) => setDocFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            {loading ? 'Mengunggah...' : 'Unggah Dokumen'}
          </button>
        </div>
      </form>

      {/* DAFTAR DOKUMEN */}
      <div className="pt-4 w-full max-w-full min-w-0">
        <h4 className="font-bold text-sm text-slate-900 mb-3">
          Daftar Dokumen Terunggah:
        </h4>

        <div className="w-full max-w-full min-w-0 border rounded-2xl overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch]">
          <table className="w-max min-w-full text-left text-xs">
            <thead className="bg-slate-100 border-b font-bold text-slate-700">
              <tr>
                <th className="p-3 whitespace-nowrap">Tipe Dokumen</th>
                <th className="p-3 whitespace-nowrap">Nama File</th>
                <th className="p-3 whitespace-nowrap">Status Verifikasi</th>
                <th className="p-3 whitespace-nowrap text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y text-slate-700">
              {savedDocuments.length > 0 ? (
                savedDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td className="p-3 font-bold whitespace-nowrap">
                      {doc.type}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {doc.fileName}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {doc.isVerified ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                          Terverifikasi
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold">
                          Menunggu Verifikasi
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <a
                        href={getFullDocumentUrl(doc.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-600 hover:underline font-semibold"
                      >
                        Lihat File
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400">
                    Belum ada dokumen yang diunggah.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

        {isDocumentsCompleted ? (
          <button
            type="button"
            onClick={onNext}
            disabled={loading}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-full shadow flex items-center gap-2 transition-all active:scale-95"
          >
            Lanjut Pembayaran
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <span className="text-xs text-slate-500 text-right max-w-[220px]">
            Unggah semua dokumen wajib untuk melanjutkan.
          </span>
        )}
      </div>
    </div>
  );
}
