'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  Newspaper,
  Search,
  Calendar,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  Mail,
  MapPin,
  Menu,
  X,
  FileText,
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  publishedAt?: string;
  createdAt: string;
}

export default function PublicNewsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 9 };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const res = await api.get('/news', { params });
      if (res.data) {
        setNewsList(res.data.data || []);
        setTotalPages(res.data.meta?.totalPages || 1);
        setTotalCount(res.data.meta?.total || 0);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar berita publik:', err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Terbaru';
    try {
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* ── Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-slate-900 border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mulia.png" alt="Logo Mulia Angkasa" className="w-10 h-10 object-contain" />
            <div className="leading-tight">
              <span className="text-xs sm:text-sm font-extrabold text-white block tracking-tight">
                MULIA ANGKASA AKADEMI
              </span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                Aviation Training
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center bg-white text-slate-900 px-6 py-2 rounded-full shadow-lg space-x-6 text-sm font-medium">
            <Link href="/#prodi" className="hover:text-amber-500 transition-colors">Program Studi</Link>
            <Link href="/#alur" className="hover:text-amber-500 transition-colors">Alur Pendaftaran</Link>
            <Link href="/#syarat" className="hover:text-amber-500 transition-colors">Persyaratan</Link>
            <Link href="/news" className="text-amber-600 font-bold">Berita</Link>
            <Link href="/#faq" className="hover:text-amber-500 transition-colors">FAQ</Link>
            <Link href="/#kontak" className="hover:text-amber-500 transition-colors">Kontak</Link>
          </nav>

          {/* CTA + Login */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-white hover:text-amber-400 transition-colors">
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-full shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Daftar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-800 text-white border border-slate-700"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-4 space-y-1">
            {[
              { href: '/#prodi', label: 'Program Studi' },
              { href: '/#alur', label: 'Alur Pendaftaran' },
              { href: '/#syarat', label: 'Persyaratan' },
              { href: '/news', label: 'Berita', active: true },
              { href: '/#faq', label: 'FAQ' },
              { href: '/#kontak', label: 'Kontak' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${link.active ? 'text-amber-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <Link href="/login" className="flex-1 text-center py-2 text-xs font-semibold text-slate-200 bg-slate-800 rounded-xl">
                Login
              </Link>
              <Link href="/register" className="flex-1 text-center py-2 text-xs font-bold text-slate-900 bg-amber-400 rounded-xl">
                Daftar PMB
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="pt-16 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-50 text-slate-900 ">
              <Newspaper className="w-3.5 h-3.5" />
              <span>Pusat Berita dan Informasi Kampus</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Warta dan Aktivitas<br />
              <span className="text-amber-400">Mulia Angkasa Akademi</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
              Ikuti kabar terbaru seputar penerimaan mahasiswa baru, informasi beasiswa, pelatihan penerbangan, wisuda, dan kiprah alumni di dunia aviasi.
            </p>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Search + Counter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari topik atau judul berita..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
            />
          </div>
          <div className="text-sm font-semibold text-slate-500 whitespace-nowrap">
            <span className="font-bold text-slate-900">{totalCount}</span> berita dipublikasikan
          </div>
        </div>

        {/* Grid / Loading / Empty */}
        {loading ? (
          <div className="py-32 flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Memuat kabar berita...</p>
          </div>
        ) : newsList.length === 0 ? (
          <div className="py-24 flex flex-col items-center gap-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-amber-400/10 text-amber-600 flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-800">Tidak ada berita ditemukan</h3>
              <p className="text-xs text-slate-500 max-w-md">
                {debouncedSearch
                  ? `Tidak ada artikel yang cocok dengan "${debouncedSearch}".`
                  : 'Belum ada berita yang dipublikasikan. Silakan kembali lagi nanti.'}
              </p>
            </div>
            {debouncedSearch && (
              <button
                onClick={() => setSearch('')}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-amber-400 hover:text-slate-900 transition-all"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {newsList.map((item) => (
              <NewsCard key={item.id} item={item} formatDate={formatDate} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-10 mt-4 border-t border-slate-200">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 shadow-sm transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold px-3 text-slate-700">
              Halaman {page} dari {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 shadow-sm transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 text-slate-400 py-14 border-t border-slate-900 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 pb-10">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-mulia.png" alt="Logo" className="w-10 h-10 object-contain" />
                <span className="text-xs font-extrabold text-white tracking-tight">MULIA ANGKASA AKADEMI</span>
              </div>
              <p className="text-xs leading-relaxed">
                Pusat pendidikan dan pelatihan karir penerbangan terbaik di Indonesia.
              </p>
            </div>

            {/* Nav */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Navigasi Pendaftaran</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/register" className="hover:text-amber-400 transition-colors">Registrasi Calon Mahasiswa</Link></li>
                <li><Link href="/login" className="hover:text-amber-400 transition-colors">Login Portal Pendaftar</Link></li>
                <li><Link href="/#prodi" className="hover:text-amber-400 transition-colors">Pilihan Jurusan</Link></li>
                <li><Link href="/#alur" className="hover:text-amber-400 transition-colors">Alur PMB Online</Link></li>
                <li><Link href="/news" className="hover:text-amber-400 transition-colors">Berita & Informasi</Link></li>
              </ul>
            </div>

            {/* Program */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Program Studi</h4>
              <ul className="space-y-2 text-xs">
                <li>Air Lines Crew (Pramugari & Staff)</li>
                <li>AVSEC (Aviation Security License)</li>
                <li>Ground Handling Operational</li>
              </ul>
            </div>

            {/* Kontak */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Kontak Kampus</h4>
              <ul className="space-y-3 text-xs">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>Jl. Kesambi No.92, Kesambi, Kota Cirebon, Jawa Barat 45134</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>muliaangkasaakademi@gmail.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>081255401558</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-600">
            © {new Date().getFullYear()} Kampus Mulia Angkasa Akademi. All rights reserved. Penerimaan Mahasiswa Baru System.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── News Card Component ── */
function NewsCard({
  item,
  formatDate,
}: {
  item: NewsItem;
  formatDate: (d?: string) => string;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
      {/* Cover Image */}
      <Link href={`/news/${item.slug}`} className="block relative w-full overflow-hidden bg-slate-100" style={{ paddingBottom: '56.25%' }}>
        {item.imageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.title}
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-500 gap-2">
            <Newspaper className="w-10 h-10 opacity-30" />
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-50">Mulia Angkasa News</span>
          </div>
        )}
        {/* Badge */}
        <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-amber-400 text-slate-900 shadow-sm">
          Berita Kampus
        </span>
      </Link>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span>{formatDate(item.publishedAt)}</span>
        </div>

        <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-amber-600 transition-colors line-clamp-2 flex-1">
          <Link href={`/news/${item.slug}`}>{item.title}</Link>
        </h3>

        {item.excerpt && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.excerpt}</p>
        )}

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          <span className="text-xs font-semibold text-slate-400">Mulia Angkasa Akademi</span>
          <Link
            href={`/news/${item.slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 group-hover:text-amber-500 transition-colors"
          >
            <span>Baca Selengkapnya</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
