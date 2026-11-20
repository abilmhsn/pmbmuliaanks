'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { useSuperAdminTheme } from '@/context/SuperAdminThemeContext';
import {
  Newspaper,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  Eye,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    email: string;
  };
}

export default function SuperAdminNewsPage() {
  const { isDark } = useSuperAdminTheme();
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedNewsToDelete, setSelectedNewsToDelete] = useState<NewsItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification Toast
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 10,
      };
      if (search.trim() !== '') {
        params.search = search.trim();
      }
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      const res = await api.get('/news/admin/all', { params });
      if (res.data) {
        setNewsList(res.data.data || []);
        setTotalPages(res.data.meta?.totalPages || 1);
        setTotalCount(res.data.meta?.total || 0);
      }
    } catch (err: any) {
      console.error('Gagal mengambil daftar berita:', err);
      showToast('error', err.response?.data?.message || 'Gagal memuat daftar berita');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleDeleteConfirm = async () => {
    if (!selectedNewsToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/news/${selectedNewsToDelete.id}`);
      showToast('success', `Berita "${selectedNewsToDelete.title}" berhasil dihapus.`);
      setDeleteModalOpen(false);
      setSelectedNewsToDelete(null);
      fetchNews();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Gagal menghapus berita');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold transition-all animate-bounce ${
            notification.type === 'success'
              ? 'bg-emerald-500/90 text-white border-emerald-400'
              : 'bg-rose-500/90 text-white border-rose-400'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border transition-all ${
          isDark
            ? 'bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900/80 border-purple-900/40'
            : 'bg-gradient-to-r from-purple-50 via-white to-amber-50/40 border-purple-100 shadow-sm'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Newspaper className="w-3.5 h-3.5" />
              <span>Manajemen Konten</span>
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Berita & Informasi Kampus
            </h1>
            <p
              className={`text-xs sm:text-sm max-w-2xl ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Kelola artikel, kegiatan, pengumuman publik, dan publikasi resmi untuk pengunjung website PMB Mulia Angkasa Akademi.
            </p>
          </div>

          <Link
            href="/super-admin/news/create"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Berita Baru</span>
          </Link>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div
        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
          isDark
            ? 'bg-slate-900/80 border-slate-800'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search
            className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari berita berdasarkan judul atau ringkasan..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => {
                setStatusFilter('PUBLISHED');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'PUBLISHED'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => {
                setStatusFilter('DRAFT');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'DRAFT'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Draft
            </button>
          </div>

          <button
            onClick={() => fetchNews()}
            title="Muat Ulang"
            className={`p-2.5 rounded-xl border transition-all ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div
        className={`rounded-2xl border overflow-hidden transition-all ${
          isDark
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  isDark
                    ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 w-24">Cover</th>
                <th className="py-3.5 px-4">Judul Berita & Slug</th>
                <th className="py-3.5 px-4 w-32">Status</th>
                <th className="py-3.5 px-4 w-36">Tgl Publikasi</th>
                <th className="py-3.5 px-4 w-32">Dibuat</th>
                <th className="py-3.5 px-4 w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                        Memuat data berita...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : newsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          isDark
                            ? 'bg-slate-800 text-slate-500'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <FileText className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <p
                          className={`text-sm font-bold ${
                            isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          Belum ada berita ditemukan
                        </p>
                        <p
                          className={`text-xs ${
                            isDark ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        >
                          {search
                            ? 'Coba ganti kata kunci pencarian Anda'
                            : 'Mulai dengan menambahkan berita baru untuk portal PMB'}
                        </p>
                      </div>
                      <Link
                        href="/super-admin/news/create"
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tulis Berita Sekarang</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                newsList.map((item, index) => {
                  const rowNumber = (page - 1) * 10 + index + 1;
                  const isPublished = item.status === 'PUBLISHED';
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isDark
                          ? 'hover:bg-slate-800/40'
                          : 'hover:bg-purple-50/30'
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-semibold text-slate-400">
                        {rowNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="relative w-16 h-11 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Newspaper className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-sm">
                        <div className="space-y-0.5">
                          <p
                            className={`font-bold line-clamp-2 text-xs sm:text-sm ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {item.title}
                          </p>
                          <p
                            className={`text-[11px] font-mono truncate ${
                              isDark ? 'text-purple-400/80' : 'text-purple-600'
                            }`}
                            title={`/news/${item.slug}`}
                          >
                            slug: /{item.slug}
                          </p>
                          {item.excerpt && (
                            <p
                              className={`text-[11px] line-clamp-1 ${
                                isDark ? 'text-slate-400' : 'text-slate-500'
                              }`}
                            >
                              {item.excerpt}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            isPublished
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPublished ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>{item.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className={`flex items-center gap-1.5 text-[11px] ${
                            isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(item.publishedAt)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-slate-400">
                          {formatDate(item.createdAt)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isPublished && (
                            <Link
                              href={`/news/${item.slug}`}
                              target="_blank"
                              title="Lihat Halaman Publik"
                              className={`p-1.5 rounded-lg border transition-all ${
                                isDark
                                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                              }`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          <Link
                            href={`/super-admin/news/${item.id}/edit`}
                            title="Edit Berita"
                            className="p-1.5 rounded-lg border bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20 transition-all"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedNewsToDelete(item);
                              setDeleteModalOpen(true);
                            }}
                            title="Hapus Berita"
                            className="p-1.5 rounded-lg border bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {newsList.length > 0 && (
          <div
            className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
              isDark
                ? 'border-slate-800 text-slate-400 bg-slate-950/40'
                : 'border-slate-200 text-slate-600 bg-slate-50'
            }`}
          >
            <div>
              Menampilkan{' '}
              <span className="font-bold text-purple-500">{newsList.length}</span>{' '}
              dari{' '}
              <span className="font-bold text-purple-500">{totalCount}</span>{' '}
              total berita
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold px-2">
                Halaman {page} dari {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Hapus */}
      {deleteModalOpen && selectedNewsToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl transition-all ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-bold mb-2">Hapus Berita Ini?</h3>
            <p
              className={`text-xs leading-relaxed mb-4 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Anda akan menghapus berita:{' '}
              <strong className="text-rose-400">
                "{selectedNewsToDelete.title}"
              </strong>
              . File cover pada Supabase Storage juga akan dibersihkan secara otomatis. Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  isDark
                    ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus Sekarang</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
