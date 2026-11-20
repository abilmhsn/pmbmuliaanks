'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useSuperAdminTheme } from '@/context/SuperAdminThemeContext';
import RichTextEditor from '@/components/RichTextEditor';
import {
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
  Calendar,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  FileText,
  Globe,
  Clock,
} from 'lucide-react';

export default function SuperAdminCreateNewsPage() {
  const router = useRouter();
  const { isDark } = useSuperAdminTheme();

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');
  const [publishedAt, setPublishedAt] = useState(
    new Date().toISOString().slice(0, 16)
  );

  // Cover Image
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Submitting
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Otomatis buat slug saat judul berubah jika belum diedit manual
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManuallyEdited) {
      const generated = val
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Harap unggah file berformat gambar (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Ukuran gambar maksimal 5MB');
      return;
    }

    setCoverFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCoverPreview(objectUrl);
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleSubmit = async (targetStatus?: 'DRAFT' | 'PUBLISHED') => {
    const finalStatus = targetStatus || status;

    if (!title.trim()) {
      showToast('error', 'Judul berita wajib diisi');
      return;
    }

    if (!content.trim() || content.trim() === '<p><br></p>') {
      showToast('error', 'Isi artikel berita wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedImageUrl = '';

      // Upload gambar ke Supabase Storage terlebih dahulu jika ada file dipilih
      if (coverFile) {
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('file', coverFile);

        const uploadRes = await api.post('/news/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (uploadRes.data?.url) {
          uploadedImageUrl = uploadRes.data.url;
        }
      }

      const payload: any = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        content,
        imageUrl: uploadedImageUrl || undefined,
        status: finalStatus,
        publishedAt: finalStatus === 'PUBLISHED' ? new Date(publishedAt).toISOString() : undefined,
      };

      await api.post('/news', payload);
      showToast('success', `Berhasil menyimpan berita (${finalStatus})!`);
      setTimeout(() => {
        router.push('/super-admin/news');
      }, 1000);
    } catch (err: any) {
      console.error('Gagal menyimpan berita:', err);
      showToast('error', err.response?.data?.message || 'Gagal menyimpan berita');
    } finally {
      setIsUploadingImage(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-500/90 text-white border-emerald-400'
              : 'bg-rose-500/90 text-white border-rose-400'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/super-admin/news"
          className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Berita</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit('DRAFT')}
            disabled={submitting}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              isDark
                ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-amber-300'
                : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm'
            } active:scale-95 disabled:opacity-50`}
          >
            Simpan Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={submitting}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5" />
                <span>Publikasikan Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Form Box */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border transition-all space-y-6 ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="border-b pb-4 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold">Buat Berita Baru</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Isi informasi berita, artikel, atau kegiatan PMB Kampus Mulia Angkasa Akademi.
            </p>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="space-y-5">
          {/* Judul Berita */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider block">
              Judul Berita <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Contoh: Mulia Angkasa Akademi Buka Pendaftaran Jalur Beasiswa Aviasi 2026"
              className={`w-full px-4 py-3 rounded-2xl text-sm font-semibold border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Slug URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider block">
                Slug URL (Ramah SEO)
              </label>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Otomatis dibuat dari judul (dapat Anda sesuaikan)
              </span>
            </div>
            <div className="relative">
              <span
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold select-none ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                }`}
              >
                /news/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setIsSlugManuallyEdited(true);
                }}
                placeholder="judul-berita-anda"
                className={`w-full pl-20 pr-4 py-2.5 rounded-2xl text-xs font-mono border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-purple-200'
                    : 'bg-slate-50 border-slate-200 text-purple-900'
                }`}
              />
            </div>
          </div>

          {/* Upload Cover & Pengaturan Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Upload Cover */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block">
                Foto Cover / Thumbnail Berita
              </label>

              {coverPreview ? (
                <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-purple-500/30 group">
                  <img
                    src={coverPreview}
                    alt="Preview Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label
                      htmlFor="cover-upload"
                      className="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      Ganti Foto
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="cover-upload"
                  className={`w-full h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 cursor-pointer transition-all ${
                    isDark
                      ? 'border-slate-800 hover:border-purple-500/60 bg-slate-950/50 hover:bg-slate-950'
                      : 'border-slate-300 hover:border-purple-400 bg-slate-50 hover:bg-purple-50/20'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold">Pilih gambar cover</p>
                  <p className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    PNG, JPG, atau WEBP (Maksimal 5MB)
                  </p>
                </label>
              )}
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                onChange={handleCoverSelect}
                className="hidden"
              />
            </div>

            {/* Tanggal & Status Publikasi */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider block">
                  Status Berita
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('PUBLISHED')}
                    className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      status === 'PUBLISHED'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm'
                        : isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Published</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('DRAFT')}
                    className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      status === 'DRAFT'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-sm'
                        : isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Draft</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider block">
                  Tanggal & Waktu Publikasi
                </label>
                <div className="relative">
                  <Calendar
                    className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  />
                  <input
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-100'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ringkasan Berita (Excerpt) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider block">
              Ringkasan Berita (Excerpt)
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Tulis ringkasan singkat 1-2 kalimat untuk kartu berita di halaman utama..."
              className={`w-full px-4 py-2.5 rounded-2xl text-xs border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Konten Berita (Rich Text Editor) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider block">
              Isi Konten Berita <span className="text-rose-500">*</span>
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Tulis isi berita lengkap di sini..."
              isDark={isDark}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t pt-5 dark:border-slate-800 flex items-center justify-between">
          <Link
            href="/super-admin/news"
            className={`px-4 py-2 rounded-xl text-xs font-semibold ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Batal
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit('DRAFT')}
              disabled={submitting}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                isDark
                  ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-amber-300'
                  : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
              } active:scale-95 disabled:opacity-50`}
            >
              Simpan Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('PUBLISHED')}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan Berita...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Publikasikan Berita</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
