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
  BookOpen,
  ArrowRight,
  PhoneCall,
  Mail,
  MapPin,
  Menu,
  X,
  AlertCircle,
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
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

  // Estimasi waktu baca
  const getReadingTime = (content: string) => {
    const text = content.replace(/<[^>]*>?/gm, '');
    const wordCount = text.split(/\s+/).length;
    const time = Math.ceil(wordCount / 200);
    return `${time || 1} menit baca`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header & Navbar Publik */}
      <header className="fixed top-0 left-0 right-0 z-[100] py-3 px-3 sm:px-6 lg:px-8 bg-slate-900 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="relative w-12 h-12 sm:w-15 sm:h-15 flex-shrink-0">
              <Image
                src="/logo-mulia.png"
                alt="Logo Mulia Angkasa"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-extrabold tracking-tight text-white block leading-tight">
                MULIA ANGKASA AKADEMI
              </span>
              <span className="block text-[8px] sm:text-[9px] font-semibold text-white tracking-wider uppercase">
                Aviation Training
              </span>
            </div>
          </Link>

          {/* Menu Navigasi Tengah */}
          <nav className="hidden md:flex items-center bg-white text-slate-900 px-6 py-2.5 rounded-full shadow-lg backdrop-blur-lg space-x-6 lg:space-x-8 text-sm font-medium">
            <Link href="/#prodi" className="hover:text-amber-500 transition-colors">Program Studi</Link>
            <Link href="/#alur" className="hover:text-amber-500 transition-colors">Alur Pendaftaran</Link>
            <Link href="/#syarat" className="hover:text-amber-500 transition-colors">Persyaratan</Link>
            <Link href="/news" className="text-amber-600 font-bold transition-colors">Berita</Link>
            <Link href="/#faq" className="hover:text-amber-500 transition-colors">FAQ</Link>
            <Link href="/#kontak" className="hover:text-amber-500 transition-colors">Kontak</Link>
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
              className="px-5 py-2.5 text-sm font-bold text-slate-900 bg-white hover:bg-amber-400 rounded-full shadow-md transition-all flex items-center gap-1.5 group"
            >
              <span>Daftar</span>
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/register"
              className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-amber-400 rounded-full shadow-sm flex items-center gap-1"
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

      {/* Main Container */}
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="py-4 flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-amber-500 transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/news" className="hover:text-amber-500 transition-colors">
              Berita
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
              {news?.title || 'Detail Berita'}
            </span>
          </div>

          {loading ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Memuat artikel berita...</p>
            </div>
          ) : error || !news ? (
            <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-slate-200 p-8 my-8">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                Berita Tidak Ditemukan
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {error || 'Artikel yang Anda cari tidak tersedia atau belum dipublikasikan.'}
              </p>
              <Link
                href="/news"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-amber-400 hover:text-slate-900 transition-all shadow-md"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Katalog Berita</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-4">
              {/* Main Article Column */}
              <article className="lg:col-span-8 space-y-6">
                {/* Back Button */}
                <Link
                  href="/news"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-amber-500 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Semua Berita</span>
                </Link>

                {/* Article Header */}
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-800 border border-amber-300">
                    <Newspaper className="w-3.5 h-3.5" />
                    <span>Warta Resmi Kampus</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {news.title}
                  </h1>

                  {/* Metadata bar */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <span>{formatDate(news.publishedAt)}</span>
                    </div>

                    <span className="text-slate-300">•</span>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{getReadingTime(news.content)}</span>
                    </div>

                    <span className="text-slate-300">•</span>

                    <span className="font-semibold text-slate-700">
                      Oleh: Tim Humas PMB Mulia Angkasa
                    </span>
                  </div>
                </div>

                {/* Cover Image */}
                {news.imageUrl && (
                  <div className="relative w-full h-[280px] sm:h-[420px] rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-100">
                    <img
                      src={news.imageUrl}
                      alt={news.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Excerpt Callout */}
                {news.excerpt && (
                  <div className="p-5 rounded-2xl bg-amber-50/70 border-l-4 border-amber-400 text-slate-700 text-sm sm:text-base italic leading-relaxed">
                    "{news.excerpt}"
                  </div>
                )}

                {/* Article Content Render */}
                <div
                  className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-sm sm:text-base pt-2 [&>h2]:text-xl sm:[&>h2]:text-2xl [&>h2]:font-extrabold [&>h2]:text-slate-900 [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-lg sm:[&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-6 [&>h3]:mb-3 [&>p]:mb-4 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4 [&>blockquote]:border-l-4 [&>blockquote]:border-purple-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-slate-600 [&>img]:rounded-2xl [&>img]:shadow-md [&>img]:my-6 [&>a]:text-purple-600 [&>a]:underline hover:[&>a]:text-purple-800"
                  dangerouslySetInnerHTML={{ __html: news.content }}
                />

                {/* Share Section */}
                <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-700">Bagikan artikel ini:</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-all active:scale-95"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 font-bold">Tautan Disalin!</span>
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
                      className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all"
                      title="Bagikan ke WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>

                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        typeof window !== 'undefined' ? window.location.href : ''
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                      title="Bagikan ke Facebook"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
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
                      className="p-2 rounded-xl bg-slate-900 hover:bg-black text-white shadow-sm transition-all"
                      title="Bagikan ke X"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </article>

              {/* Sidebar Column */}
              <aside className="lg:col-span-4 space-y-6">
                {/* CTA Pendaftaran PMB Box */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 border border-white/10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950">
                    PMB 2026 Dibuka
                  </div>
                  <h3 className="text-xl font-extrabold leading-snug">
                    Wujudkan Impian Berkarir di Dunia Penerbangan!
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Daftar sekarang untuk menjadi Pramugari, AVSEC Berlisensi, atau Ground Staff di maskapai ternama.
                  </p>
                  <Link
                    href="/register"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg transition-all active:scale-95"
                  >
                    <span>Daftar Calon Mahasiswa</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Berita Terbaru Lainnya */}
                {recentNews.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-500" />
                      <span>Berita Terkini Lainnya</span>
                    </h3>

                    <div className="space-y-4">
                      {recentNews.map((item) => (
                        <Link
                          key={item.id}
                          href={`/news/${item.slug}`}
                          className="flex gap-3 group items-start"
                        >
                          <div className="relative w-18 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                                <Newspaper className="w-5 h-5 opacity-40" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <span className="text-[10px] text-slate-400 block">
                              {formatDate(item.publishedAt)}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-500 transition-colors line-clamp-2 leading-snug">
                              {item.title}
                            </h4>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <Link
                      href="/news"
                      className="block text-center pt-2 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      Lihat Semua Berita →
                    </Link>
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
