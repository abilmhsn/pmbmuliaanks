'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Check,
  MessageCircle,
  Newspaper,
  ArrowRight,
  PhoneCall,
  Mail,
  MapPin,
  Menu,
  X,
  AlertCircle,
  ChevronRight,
  Plane,
  Link2,
} from 'lucide-react';

interface NewsDetail {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  imageUrl?: string;
  status: string;
  publishedAt?: string;
  createdAt: string;
  author?: {
    id: string;
    email: string;
  };
}

interface RecentNews {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  publishedAt?: string;
}

export default function PublicNewsDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <NewsDetailContent />
    </Suspense>
  );
}

function NewsDetailContent() {
  const params = useParams();
  const slug = params?.slug as string;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [recentNews, setRecentNews] = useState<RecentNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (totalScroll / windowHeight) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!slug) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/news/${slug}`);
        if (res.data) {
          setNews(res.data.news);
          setRecentNews(res.data.recentNews || []);
        }
      } catch (err: any) {
        console.error('Gagal memuat berita:', err);
        setError(err.response?.data?.message || 'Berita tidak ditemukan atau belum dipublikasikan');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Terbaru';
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateString;
    }
  };

  const getReadingTime = (content: string) => {
    const text = content.replace(/<[^>]*>?/gm, '');
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const time = Math.ceil(wordCount / 200);
    return `${time || 1} menit baca`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-amber-400 selection:text-slate-950">
      {/* Header & Navbar Publik */}
      <header className="fixed top-0 left-0 right-0 z-[100] py-3 px-3 sm:px-6 lg:px-8 bg-slate-900/95 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
              <Image
                src="/logo-mulia.png"
                alt="Logo Mulia Angkasa"
                fill
                sizes="(max-width: 640px) 48px, 56px"
                priority
                className="object-contain"
              />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-extrabold tracking-tight text-white block leading-tight">
                MULIA ANGKASA AKADEMI
              </span>
              <span className="block text-[8px] sm:text-[9px] font-semibold text-amber-400 tracking-widest uppercase">
                Aviation Training
              </span>
            </div>
          </Link>

          {/* Menu Navigasi Tengah */}
          <nav className="hidden md:flex items-center bg-white text-slate-900 px-6 py-2.5 rounded-full shadow-lg space-x-6 lg:space-x-8 text-sm font-medium">
            <Link href="/#prodi" className="hover:text-amber-600 transition-colors">Program Studi</Link>
            <Link href="/#alur" className="hover:text-amber-600 transition-colors">Alur Pendaftaran</Link>
            <Link href="/#syarat" className="hover:text-amber-600 transition-colors">Persyaratan</Link>
            <Link href="/news" className="text-amber-600 font-bold transition-colors">Berita</Link>
            <Link href="/#faq" className="hover:text-amber-600 transition-colors">FAQ</Link>
            <Link href="/#kontak" className="hover:text-amber-600 transition-colors">Kontak</Link>
          </nav>

          {/* Tombol CTA & Login */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-white hover:text-amber-400 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-bold text-slate-950 bg-white hover:bg-amber-400 rounded-full shadow-md transition-all flex items-center gap-1.5 group"
            >
              <span>Daftar</span>
              <span className="w-6 h-6 bg-slate-900/10 rounded-full flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/register"
              className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-full shadow-sm flex items-center gap-1"
            >
              <span>Daftar</span>
              <ArrowRight className="w-3 h-3" />
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl bg-slate-950 text-white shadow-md border border-slate-800"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Reading Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/5">
          <div
            className="h-full bg-amber-400 transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-3 right-3 bg-slate-900/98 text-white backdrop-blur-xl border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3 mt-2">
            <Link href="/#prodi" onClick={() => setIsMenuOpen(false)} className="block py-2 font-bold text-slate-300 hover:text-white border-b border-slate-800/60">Program Studi</Link>
            <Link href="/#alur" onClick={() => setIsMenuOpen(false)} className="block py-2 text-sm text-slate-300 hover:text-white border-b border-slate-800/60">Alur Pendaftaran</Link>
            <Link href="/#syarat" onClick={() => setIsMenuOpen(false)} className="block py-2 text-sm text-slate-300 hover:text-white border-b border-slate-800/60">Persyaratan</Link>
            <Link href="/news" onClick={() => setIsMenuOpen(false)} className="block py-2 text-sm text-amber-400 font-bold border-b border-slate-800/60">Berita</Link>
            <Link href="/#faq" onClick={() => setIsMenuOpen(false)} className="block py-2 text-sm text-slate-300 hover:text-white border-b border-slate-800/60">FAQ</Link>
            <Link href="/#kontak" onClick={() => setIsMenuOpen(false)} className="block py-2 text-sm text-slate-300 hover:text-white">Kontak</Link>

            <div className="pt-3 border-t border-slate-800 flex flex-col space-y-2">
              <Link href="/login" className="w-full text-center py-2.5 text-xs sm:text-sm font-semibold text-slate-200 bg-slate-800/80 rounded-xl">
                Login Portal
              </Link>
              <Link href="/register" className="w-full text-center py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl flex items-center justify-center gap-1.5 shadow-md">
                Daftar PMB Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Top Sub-Header Strip (Breadcrumb & Navigasi Kembali) */}
      <div className="pt-20 sm:pt-22 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
            <Link href="/" className="hover:text-slate-900 font-medium transition-colors flex-shrink-0">
              Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
            <Link href="/news" className="hover:text-slate-900 font-medium transition-colors flex-shrink-0">
              Berita & Warta
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
            <span className="font-semibold text-slate-900 truncate max-w-[160px] sm:max-w-sm">
              {news?.title || 'Artikel'}
            </span>
          </nav>

          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-900 text-slate-700 hover:text-white text-xs font-bold transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Semua Berita</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
              <p className="text-xs font-semibold text-slate-500 tracking-wide">
                Menyiapkan artikel berita...
              </p>
            </div>
          ) : error || !news ? (
            <div className="max-w-xl mx-auto py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 my-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 mx-auto flex items-center justify-center shadow-md">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Artikel Tidak Ditemukan
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {error || 'Berita yang Anda tuju tidak tersedia atau telah ditarik dari publikasi.'}
              </p>
              <div className="pt-2">
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-amber-400 hover:text-slate-950 transition-all shadow-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Katalog Berita</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* KOLOM UTAMA ARTIKEL (8 Kolom) */}
              <article className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
                {/* Header Artikel */}
                <div className="px-5 pt-6 pb-5 sm:px-9 sm:pt-9 sm:pb-6 border-b border-slate-100">
                  {/* Label Rubrik & Tanggal */}
                  <div className="flex flex-wrap items-center gap-2.5 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-slate-900 text-amber-400">
                      <Newspaper className="w-3 h-3" />
                      <span>Warta Kampus</span>
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      {formatDate(news.publishedAt || news.createdAt)}
                    </span>

                    <span className="text-slate-300">•</span>

                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {getReadingTime(news.content)}
                    </span>
                  </div>

                  {/* Judul Berita */}
                  <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-extrabold text-slate-950 tracking-tight leading-[1.22]">
                    {news.title}
                  </h1>

                  {/* Info Redaksi / Penulis */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-900 border border-amber-400/40 text-amber-400 font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                        MA
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Tim Humas & Publikasi
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Mulia Angkasa Akademi Cirebon
                        </div>
                      </div>
                    </div>

                    {/* Tombol Salin Cepat di Header */}
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-900 text-slate-600 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
                      title="Salin tautan artikel"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 font-bold">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Link2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Salin Tautan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Gambar Utama Berita (Proporsional 16:9) */}
                {news.imageUrl && (
                  <div className="px-5 pt-5 sm:px-9 sm:pt-7">
                    <figure className="rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100">
                      <div className="relative w-full aspect-[16/9] max-h-[430px] overflow-hidden">
                        <img
                          src={news.imageUrl}
                          alt={news.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <figcaption className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="truncate">
                          Dokumentasi: {news.title}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0 ml-2">
                          Mulia Angkasa Media
                        </span>
                      </figcaption>
                    </figure>
                  </div>
                )}

                {/* Badan Artikel */}
                <div className="px-5 py-6 sm:px-9 sm:py-8">
                  <div className="max-w-[68ch] mx-auto space-y-6">
                    {/* Teras Berita / Lead Paragraph */}
                    {news.excerpt && (
                      <p className="text-base sm:text-[17px] font-semibold text-slate-800 leading-relaxed pl-4 border-l-[3px] border-amber-400">
                        {news.excerpt}
                      </p>
                    )}

                    {/* Isi Konten HTML */}
                    <div
                      className="prose prose-slate max-w-none text-slate-700 text-[15px] sm:text-[16px] leading-[1.85]
                        first-letter:text-4xl first-letter:font-black first-letter:text-slate-900 first-letter:mr-1.5 first-letter:float-left first-letter:leading-none
                        [&>h2]:text-xl sm:[&>h2]:text-2xl [&>h2]:font-extrabold [&>h2]:text-slate-900 [&>h2]:tracking-tight [&>h2]:mt-8 [&>h2]:mb-3
                        [&>h3]:text-lg sm:[&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-6 [&>h3]:mb-2.5
                        [&>p]:mb-5 [&>p]:leading-[1.85]
                        [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-5 [&>ul>li]:mb-2
                        [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-5 [&>ol>li]:mb-2
                        [&>blockquote]:border-l-4 [&>blockquote]:border-amber-400 [&>blockquote]:bg-slate-50 [&>blockquote]:py-3.5 [&>blockquote]:px-5 [&>blockquote]:rounded-r-xl [&>blockquote]:italic [&>blockquote]:text-slate-800 [&>blockquote]:my-6
                        [&>img]:rounded-2xl [&>img]:border [&>img]:border-slate-200 [&>img]:my-6 [&>img]:w-full
                        [&>a]:text-amber-600 [&>a]:font-semibold [&>a]:underline [&>a]:decoration-amber-400/60 hover:[&>a]:text-slate-900"
                      dangerouslySetInnerHTML={{ __html: news.content }}
                    />
                  </div>
                </div>

                {/* Footer Bagikan Artikel */}
                <div className="px-5 py-5 sm:px-9 bg-slate-50/90 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center">
                      <Share2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Bagikan Warta Ini
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Sebarkan informasi resmi kampus ke rekan Anda
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-900 text-slate-700 hover:text-white text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600">Tautan Disalin</span>
                        </>
                      ) : (
                        <span>Salin Tautan</span>
                      )}
                    </button>

                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        `${news.title}\n\nBaca selengkapnya: ${typeof window !== 'undefined' ? window.location.href : ''}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors"
                      title="Bagikan ke WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        typeof window !== 'undefined' ? window.location.href : ''
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-900 hover:bg-amber-400 text-white hover:text-slate-950 transition-colors"
                      title="Bagikan ke Facebook"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>

                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        news.title
                      )}&url=${encodeURIComponent(
                        typeof window !== 'undefined' ? window.location.href : ''
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-900 hover:bg-amber-400 text-white hover:text-slate-950 transition-colors"
                      title="Bagikan ke X"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </article>

              {/* SIDEBAR KANAN (4 Kolom - Sticky di Desktop) */}
              <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                {/* Kartu Promo Pendaftaran PMB */}
                <div className="relative overflow-hidden bg-slate-950 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-800">
                  {/* Aksen Dekoratif Halus */}
                  <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

                  <div className="relative space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                        PMB 2026/2027 Dibuka
                      </span>
                      <Plane className="w-4 h-4 text-amber-400" />
                    </div>

                    <h3 className="text-lg sm:text-xl font-extrabold leading-snug text-white">
                      Wujudkan Impian Berkarir di Dunia Penerbangan!
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Bergabunglah bersama Mulia Angkasa Akademi untuk menjadi Pramugari, AVSEC Berlisensi, atau Ground Staff profesional.
                    </p>

                    <div className="pt-1">
                      <Link
                        href="/register"
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95"
                      >
                        <span>Daftar Calon Mahasiswa</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Daftar Berita Terkini Lainnya */}
                {recentNews.length > 0 && (
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-4 rounded-full bg-amber-400" />
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                          Berita Terkini Lainnya
                        </h3>
                      </div>
                      <Link
                        href="/news"
                        className="text-[11px] font-bold text-amber-600 hover:text-slate-900 transition-colors"
                      >
                        Lihat Semua
                      </Link>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {recentNews.map((item) => (
                        <Link
                          key={item.id}
                          href={`/news/${item.slug}`}
                          className="flex gap-3.5 py-3.5 first:pt-0 last:pb-0 group items-start"
                        >
                          <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 flex-shrink-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-amber-400/70">
                                <Newspaper className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <span className="text-[10px] font-semibold text-slate-400 block">
                              {formatDate(item.publishedAt)}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                              {item.title}
                            </h4>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer id="kontak" className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img
                  src="/logo-mulia.png"
                  alt="Logo Mulia Angkasa Akademik"
                  className="w-15 h-15 object-contain"
                />
                <span className="text-xs font-extrabold text-white tracking-tight">
                  MULIA ANGKASA AKADEMI
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Pusat pendidikan dan pelatihan karir penerbangan terbaik di Indonesia. Mencetak SDM bandara dan maskapai profesional & berdedikasi tinggi.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4">Navigasi Pendaftaran</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/register" className="hover:text-amber-400">Registrasi Calon Mahasiswa</Link></li>
                <li><Link href="/login" className="hover:text-amber-400">Login Portal Pendaftar</Link></li>
                <li><Link href="/#prodi" className="hover:text-amber-400">Pilihan Jurusan</Link></li>
                <li><Link href="/#alur" className="hover:text-amber-400">Alur PMB Online</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4">Program Studi</h4>
              <ul className="space-y-2 text-xs">
                <li>Air Lines Crew (Pramugari & Staff)</li>
                <li>AVSEC (Aviation Security License)</li>
                <li>Ground Handling Operational</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-4">Kontak Kampus</h4>
              <ul className="space-y-3 text-xs">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-white flex-shrink-0" />
                  <span>Jl. Kesambi No.92, Kesambi, Kec. Kesambi, Kota Cirebon, Jawa Barat 45134</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-white flex-shrink-0" />
                  <span>muliaangkasaakademi@gmail.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-white flex-shrink-0" />
                  <span>081255401558</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-12 mt-12 border-t border-slate-900 text-center text-xs text-slate-500">
            © 2027 Kampus Mulia Angkasa Akademi. All rights reserved. Penerimaan Mahasiswa Baru System.
          </div>
        </div>
      </footer>
    </div>
  );
}