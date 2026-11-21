'use client';

import React, { useState, useEffect } from 'react';
import {
  Upload,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  FileText,
  ExternalLink,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

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

const DOC_TYPE_LABELS: Record<string, string> = {
  FOTO: 'Foto Diri (Wajah Terlihat Jelas)',
  KTP: 'KTP / Kartu Pelajar / KK',
  IJAZAH: 'Ijazah / SKL Sementara',
  TRANSKRIP: 'Transkrip Nilai / Rapor',
  LAINNYA: 'Dokumen Pendukung Lainnya',
};

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
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const existingDocForType = savedDocuments.find(
    (doc) => doc.type === selectedDocType
  );

  // Reset pratinjau lokal setelah dokumen berhasil masuk ke daftar terunggah
  useEffect(() => {
    setLocalFile(null);
    setLocalPreviewUrl(null);
    setIsConfirmed(false);
  }, [savedDocuments.length]);

  // Bersihkan object URL saat file berganti atau komponen ditutup
  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }

    if (!file) {
      setLocalFile(null);
      setDocFile(null);
      setIsConfirmed(false);
      return;
    }

    // Validasi ukuran maksimal 1MB sebelum upload
    const maxBytes = 1 * 1024 * 1024;
    if (file.size > maxBytes) {
      alert('Ukuran file melebihi batas maksimal 1MB. Silakan kompres atau pilih file lain.');
      e.target.value = '';
      setLocalFile(null);
      setDocFile(null);
      setIsConfirmed(false);
      return;
    }

    setLocalFile(file);
    setDocFile(file);
    setIsConfirmed(false);

    if (file.type.startsWith('image/')) {
      setLocalPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClearSelectedFile = () => {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    setLocalFile(null);
    setDocFile(null);
    setIsConfirmed(false);

    const inputEl = document.getElementById('document-file-input') as HTMLInputElement | null;
    if (inputEl) {
      inputEl.value = '';
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localFile) {
      alert('Pilih file dokumen terlebih dahulu.');
      return;
    }
    if (!isConfirmed) {
      alert('Silakan centang kotak konfirmasi kesesuaian dokumen terlebih dahulu.');
      return;
    }
    onUpload(e);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const previewUrl = previewDoc ? getFullDocumentUrl(previewDoc.fileUrl) : '';
  const isPdf =
    previewDoc?.fileName?.toLowerCase().endsWith('.pdf') ||
    previewUrl.toLowerCase().includes('.pdf');

  return (
    <div className="space-y-5 sm:space-y-6">
      <h3 className="text-base sm:text-lg font-bold text-slate-900 border-b pb-3">
        Unggah Dokumen Berkas PMB
      </h3>

      {/* Checklist Dokumen (Minimal 2 Dokumen untuk Lanjut Pembayaran) */}
      <div className="bg-blue-50/90 border border-blue-200/80 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <p className="text-xs font-medium text-blue-900 leading-relaxed">
            Unggah <strong>minimal 2 dokumen</strong> di bawah ini untuk membuka tahap pembayaran (dokumen lainnya bersifat <strong>opsional</strong>):
          </p>
          <span
            className={`inline-flex items-center self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${isDocumentsCompleted
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-white text-blue-800 border border-blue-200'
              }`}
          >
            Terunggah: {savedDocuments.length} / min. 2 dokumen
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {requiredDocuments.map((type) => {
            const uploaded = savedDocuments.some((doc) => doc.type === type);

            return (
              <div
                key={type}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${uploaded
                    ? 'bg-emerald-100/90 border-emerald-200 text-emerald-800'
                    : 'bg-white border-blue-200/80 text-slate-600'
                  }`}
              >
                {uploaded ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className="truncate">{type}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Upload Dokumen */}
      <form
        onSubmit={handleFormSubmit}
        className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Jenis Dokumen
            </label>
            <select
              value={selectedDocType}
              onChange={(e) => {
                setSelectedDocType(e.target.value);
                setIsConfirmed(false);
              }}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500"
            >
              <option value="FOTO">Foto Diri (Wajah Terlihat Jelas)</option>
              <option value="KTP">KTP / Kartu Pelajar / KK</option>
              <option value="IJAZAH">Ijazah / SKL Sementara</option>
              <option value="TRANSKRIP">Transkrip Nilai / Rapor</option>
              <option value="LAINNYA">Dokumen Pendukung Lainnya</option>
            </select>
            {selectedDocType === 'FOTO' && (
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                Bebas menggunakan foto biasa (tidak wajib pasfoto formal), asalkan wajah calon pendaftar terlihat jelas.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Pilih File (JPG, PNG, PDF max 1MB)
            </label>
            <input
              id="document-file-input"
              type="file"
              required
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-sky-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 file:cursor-pointer"
            />
          </div>
        </div>

        {/* Pengingat Jika Dokumen Jenis Ini Sudah Pernah Diunggah */}
        {existingDocForType && (
          <div className="p-3.5 bg-amber-50 border border-amber-300/90 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Perhatian:</span> Dokumen{' '}
              <span className="font-extrabold">{selectedDocType}</span> sudah terunggah sebelumnya (
              <span className="font-mono text-[11px]">{existingDocForType.fileName}</span>). Jika kamu mengunggah file baru, dokumen lama akan digantikan.
            </div>
          </div>
        )}

        {/* Kotak Pratinjau & Konfirmasi Anti-Salah Upload */}
        {localFile && (
          <div className="p-4 bg-white border-2 border-sky-200 rounded-2xl space-y-3.5 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {localPreviewUrl ? (
                  <img
                    src={localPreviewUrl}
                    alt="Preview pilihan"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex flex-col items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                    <span className="text-[9px] font-extrabold mt-0.5">PDF</span>
                  </div>
                )}

                <div className="min-w-0 space-y-0.5">
                  <span className="inline-block px-2 py-0.5 bg-sky-100 text-sky-800 rounded-md text-[10px] font-extrabold uppercase">
                    Target: {DOC_TYPE_LABELS[selectedDocType] || selectedDocType}
                  </span>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {localFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Ukuran: {formatFileSize(localFile.size)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearSelectedFile}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                title="Batalkan pilihan file ini"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <label className="flex items-start gap-2.5 p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl cursor-pointer transition-colors select-none">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer shrink-0"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                Saya sudah memeriksa pratinjau file di atas dan yakin dokumen ini benar untuk kategori{' '}
                <strong className="text-slate-900">
                  {DOC_TYPE_LABELS[selectedDocType] || selectedDocType}
                </strong>.
              </span>
            </label>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading || !localFile || !isConfirmed}
            className="w-full sm:w-auto justify-center px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95"
          >
            {isConfirmed ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {loading ? 'Mengunggah...' : 'Unggah Dokumen'}
          </button>
        </div>
      </form>

      {/* DAFTAR DOKUMEN */}
      <div className="pt-2 space-y-3">
        <h4 className="font-bold text-sm text-slate-900">
          Daftar Dokumen Terunggah:
        </h4>

        {savedDocuments.length > 0 ? (
          <>
            {/* Tampilan Card Rapi Khusus Mobile */}
            <div className="space-y-2.5 sm:hidden">
              {savedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900">
                        {doc.type}
                      </span>
                      {doc.isVerified ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                          Terverifikasi
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                          Menunggu Verifikasi
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {doc.fileName}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-semibold shrink-0 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Lihat
                  </button>
                </div>
              ))}
            </div>

            {/* Tampilan Tabel Khusus Desktop */}
            <div className="hidden sm:block border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b font-bold text-slate-700">
                  <tr>
                    <th className="p-3.5">Tipe Dokumen</th>
                    <th className="p-3.5">Nama File</th>
                    <th className="p-3.5">Status Verifikasi</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y text-slate-700">
                  {savedDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold whitespace-nowrap">
                        {doc.type}
                      </td>
                      <td className="p-3.5">
                        {doc.fileName}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
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
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg font-semibold transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Lihat File
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 border border-slate-200 rounded-2xl bg-slate-50/50">
            Belum ada dokumen yang diunggah.
          </div>
        )}
      </div>

      {/* Navigasi Bawah */}
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

        {isDocumentsCompleted ? (
          <button
            type="button"
            onClick={onNext}
            disabled={loading}
            className="w-full sm:w-auto justify-center px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-full shadow flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
          >
            Lanjut Pembayaran
            <ChevronRight className="w-4 h-4 shrink-0" />
          </button>
        ) : (
          <span className="text-xs text-slate-500 text-center sm:text-right sm:max-w-[260px]">
            Unggah minimal 2 dokumen untuk melanjutkan ke pembayaran.
          </span>
        )}
      </div>

      {/* MODAL POPUP PREVIEW DOKUMEN */}
      {previewDoc && (
        <div
          onClick={() => setPreviewDoc(null)}
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header Modal */}
            <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-amber-400/15 text-amber-400 rounded-xl border border-amber-400/20 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                      {previewDoc.type}
                    </span>
                    {previewDoc.isVerified ? (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                        Terverifikasi
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-bold">
                        Menunggu Verifikasi
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 truncate mt-0.5">
                    {previewDoc.fileName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors shrink-0"
                title="Tutup Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Area Tampilan Dokumen */}
            <div className="p-4 sm:p-6 bg-slate-100 flex-1 overflow-auto flex items-center justify-center">
              {isPdf ? (
                <iframe
                  src={previewUrl}
                  title={previewDoc.fileName}
                  className="w-full h-[65vh] rounded-xl border border-slate-300 bg-white"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt={previewDoc.fileName}
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
                onClick={() => setPreviewDoc(null)}
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