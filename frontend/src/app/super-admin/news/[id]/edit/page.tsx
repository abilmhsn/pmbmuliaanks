'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useSuperAdminTheme } from '@/context/SuperAdminThemeContext';
import RichTextEditor from '@/components/RichTextEditor';
import {
  ArrowLeft,
  Save,
  Upload,
  Calendar,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Globe,
} from 'lucide-react';

export default function SuperAdminEditNewsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-[#0f172a] dark:border-sky-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <EditNewsContent />
    </Suspense>
  );
}

function EditNewsContent() {
  const router = useRouter();
  const params = useParams();
  const newsId = params?.id as string;
  const { isDark } = useSuperAdminTheme();

  // Loading
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');
  const [publishedAt, setPublishedAt] = useState('');

  // Existing Cover & New Cover
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Submitting
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    if (!newsId) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/news/admin/${newsId}`);
        const data = res.data;
        if (data) {
          setTitle(data.title || '');
          setSlug(data.slug || '');
          setExcerpt(data.excerpt || '');
          setContent(data.content || '');
          setStatus(data.status || 'DRAFT');
          if (data.publishedAt) {
            const dateObj = new Date(data.publishedAt);
            setPublishedAt(dateObj.toISOString().slice(0, 16));
          } else {
            setPublishedAt(new Date().toISOString().slice(0, 16));
          }
          if (data.imageUrl) {
            setExistingImageUrl(data.imageUrl);
            setCoverPreview(data.imageUrl);
          }
        }
      } catch (err: any) {
        console.error('Gagal mengambil data berita:', err);
        showToast('error', err.response?.data?.message || 'Gagal memuat berita');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [newsId]);

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
    setExistingImageUrl(null);
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
      let finalImageUrl = existingImageUrl;

      // Upload file baru jika admin memilih gambar baru
      if (coverFile) {
        const formData = new FormData();
        formData.append('file', coverFile);

        const uploadRes = await api.post('/news/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (uploadRes.data?.url) {
          finalImageUrl = uploadRes.data.url;
        }
      }

      const payload: any = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        content,
        imageUrl: finalImageUrl,
        status: finalStatus,
        publishedAt:
          finalStatus === 'PUBLISHED' && publishedAt
            ? new Date(publishedAt).toISOString()
            : undefined,
      };

      await api.patch(`/news/${newsId}`, payload);
      showToast('success', 'Berita berhasil diperbarui!');
      setTimeout(() => {
        router.push('/super-admin/news');
      }, 1000);
    } catch (err: any) {
      console.error('Gagal memperbarui berita:', err);
      showToast('error', err.response?.data?.message || 'Gagal memperbarui berita');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div
          className={`w-10 h-10 rounded-full border-4 border-t-transparent animate-spin ${isDark ? 'border-sky-400' : 'border-[#0f172a]'
            }`}
        />
        <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Memuat data berita...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold transition-all ${toast.type === 'success'
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/super-admin/news"
          className={`inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all ${isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 hover:text-[#0f172a] hover:bg-slate-200/70'
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
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isDark
                ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-amber-300'
                : 'border-slate-300 bg-white hover:bg-slate-50 text-[#0f172a] shadow-sm'
              } active:scale-95 disabled:opacity-50`}
          >
            Simpan Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={submitting}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 ${isDark
                ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/25'
                : 'bg-[#0f172a] hover:bg-slate-800 shadow-slate-900/20'
              }`}
          >
            {submitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Perbarui Berita</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Form Box */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border transition-all space-y-6 ${isDark
            ? 'bg-[#0f172a] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-[#0f172a] shadow-sm'
          }`}
      >
        <div
          className={`border-b pb-4 flex flex-wrap items-center justify-between gap-2 ${isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
        >
          <div>
            <h2 className="text-xl font-extrabold">Edit Berita</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Perbarui judul, slug, cover, konten, atau status publikasi berita ini.
            </p>
          </div>
          {status === 'PUBLISHED' && (
            <Link
              href={`/news/${slug}`}
              target="_blank"
              className={`text-xs hover:underline inline-flex items-center gap-1 font-bold ${isDark ? 'text-sky-400' : 'text-[#0f172a]'
                }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Lihat Halaman Publik</span>
            </Link>
          )}
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
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul artikel berita..."
              className={`w-full px-4 py-3 rounded-2xl text-sm font-semibold border transition-all focus:outline-none focus:ring-2 ${isDark
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:ring-sky-500'
                  : 'bg-slate-50 border-slate-200 text-[#0f172a] placeholder-slate-400 focus:ring-[#0f172a]'
                }`}
            />
          </div>

          {/* Slug URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider block">
              Slug URL (Ramah SEO)
            </label>
            <div className="relative">
              <span
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold select-none ${isDark ? 'text-sky-400' : 'text-[#0f172a]'
                  }`}
              >
                /news/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="judul-berita-anda"
                className={`w-full pl-20 pr-4 py-2.5 rounded-2xl text-xs font-mono border transition-all focus:outline-none focus:ring-2 ${isDark
                    ? 'bg-slate-950 border-slate-800 text-sky-200 focus:ring-sky-500'
                    : 'bg-slate-50 border-slate-200 text-[#0f172a] focus:ring-[#0f172a]'
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
                <div
                  className={`relative w-full h-48 rounded-2xl overflow-hidden border group ${isDark ? 'border-sky-500/30' : 'border-slate-300'
                    }`}
                >
                  <img
                    src={coverPreview}
                    alt="Preview Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label
                      htmlFor="cover-edit-upload"
                      className="px-3 py-1.5 rounded-xl bg-white text-[#0f172a] font-bold text-xs cursor-pointer hover:bg-slate-100 transition-colors"
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
                  htmlFor="cover-edit-upload"
                  className={`w-full h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 cursor-pointer transition-all ${isDark
                      ? 'border-slate-800 hover:border-sky-500/60 bg-slate-950/50 hover:bg-slate-950'
                      : 'border-slate-300 hover:border-[#0f172a] bg-slate-50 hover:bg-slate-100/70'
                    }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 ${isDark
                        ? 'bg-sky-500/15 text-sky-400'
                        : 'bg-[#0f172a]/10 text-[#0f172a]'
                      }`}
                  >
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold">Pilih gambar cover baru</p>
                  <p className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    PNG, JPG, atau WEBP (Maksimal 5MB)
                  </p>
                </label>
              )}
              <input
                id="cover-edit-upload"
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
                    className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${status === 'PUBLISHED'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-500 shadow-sm'
                        : isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-[#0f172a]'
                      }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Published</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('DRAFT')}
                    className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${status === 'DRAFT'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-500 shadow-sm'
                        : isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-[#0f172a]'
                      }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Draft</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider block">
                  Tanggal &amp; Waktu Publikasi
                </label>
                <div className="relative">
                  <Calendar
                    className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                  />
                  <input
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all focus:outline-none focus:ring-2 ${isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-100 focus:ring-sky-500'
                        : 'bg-slate-50 border-slate-200 text-[#0f172a] focus:ring-[#0f172a]'
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
              placeholder="Tulis ringkasan singkat artikel..."
              className={`w-full px-4 py-2.5 rounded-2xl text-xs border transition-all focus:outline-none focus:ring-2 ${isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-sky-500'
                  : 'bg-slate-50 border-slate-200 text-[#0f172a] placeholder-slate-400 focus:ring-[#0f172a]'
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
        <div
          className={`border-t pt-5 flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
        >
          <Link
            href="/super-admin/news"
            className={`px-4 py-2 rounded-xl text-xs font-semibold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-[#0f172a]'
              }`}
          >
            Batal
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit('DRAFT')}
              disabled={submitting}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${isDark
                  ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-amber-300'
                  : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-[#0f172a]'
                } active:scale-95 disabled:opacity-50`}
            >
              Simpan Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('PUBLISHED')}
              disabled={submitting}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 ${isDark
                  ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/25'
                  : 'bg-[#0f172a] hover:bg-slate-800 shadow-slate-900/20'
                }`}
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan Perubahan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}