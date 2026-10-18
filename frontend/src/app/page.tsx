'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plane, ShieldCheck, UserCheck, FileText, CreditCard, Award, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, PhoneCall, MessageCircle, ArrowRight, BookOpen, MapPin,
  Mail, Clock, Menu, X, Sparkles, Users,
}
  from 'lucide-react';
import api from '@/lib/api';
import Image from 'next/image';

const heroSlides = [
  {
    src: '/muliafoto.jpeg',
    alt: 'Kampus Mulia Angkasa Akademik',
    title: 'KAMPUS MULIA ANGKASA AKADEMI',
    subtitle: 'Official Student Admission System',
    tag: 'Kampus Mulia Angkasa',
  },
  {
    src: '/muliafotoo.png',
    alt: 'Air Lines Crew Training',
    title: 'AIR LINES CREW TRAINING',
    subtitle: 'Pramugari / Pramugara & Staff Aviation',
    tag: 'Air Lines Crew',
  },
  {
    src: '/muliafoto3.png',
    alt: 'AVSEC Aviation Security License',
    title: 'AVSEC BANDARA CERTIFIED',
    subtitle: 'Keamanan Bandar Udara & Lisensi Resmi',
    tag: 'Aviation Security License',
  },
];

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [programs, setPrograms] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Hero Photo Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progRes, annRes] = await Promise.all([
          api.get('/study-programs'),
          api.get('/announcements'),
        ]);
        setPrograms(progRes.data);
        setAnnouncements(annRes.data);
      } catch (err) {
        console.error('Error fetching public landing data:', err);
      }
    };
    fetchData();
  }, []);

  const faqs = [
    {
      q: 'Apa saja persyaratan fisik untuk masuk jurusan Air Lines Crew & AVSEC?',
      a: 'Untuk Air Lines Crew (Pramugari/Pramugara): Tinggi badan minimal Putri 160 cm, Putra 170 cm, penampilan menarik, tidak buta warna, dan sehat jasmani rohani. Untuk AVSEC: Tinggi badan minimal Putri 160 cm, Putra 168 cm, dan tidak bertato.',
    },
    {
      q: 'Apakah ijazah atau SKL belum terbit tetap bisa mendaftar?',
      a: 'Bisa! Bagi siswa kelas XII SMA/SMK/MA yang belum lulus/belum menerima ijazah, dapat menggunakan Surat Keterangan Lulus (SKL) sementara atau Rapor semester 1-5 terlebih dahulu.',
    },
    {
      q: 'Bagaimana sistem pembayaran biaya pendaftaran?',
      a: 'Pembayaran dapat dilakukan dengan transfer ke rekening resmi Kampus Mulia Angkasa Akademi, kemudian mengunggah bukti transfer pada sistem dashboard calon mahasiswa.',
    },
    {
      q: 'Apakah lulusan Kampus Mulia Angkasa Akademi dijamin dibantu penyaluran kerja?',
      a: 'Ya, Kampus Mulia Angkasa Akademi memiliki Career Development Center (CDC) yang bekerjasama dengan berbagai maskapai penerbangan domestik & internasional serta pengelola bandara untuk pendampingan karir hingga penempatan kerja.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* Header & Navbar - Glassy Floating Capsule Design (Fully Responsive) */}
      <header className="sticky top-0 z-50 py-3 px-3 sm:px-6 lg:px-8 bg-white/40 backdrop-blur-md border-b border-white/20 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          {/* Logo di Kiri (Responsif ukuran di mobile & desktop) */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="relative w-12 h-12 sm:w-12 sm:h-12 flex-shrink-0">
              <Image
                src="/logo-mulia.png"
                alt="Logo Mulia Angkasa"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-extrabold tracking-tight text-slate-900 block leading-tight">
                MULIA ANGKASA AKADEMIK
              </span>
              <span className="block text-[8px] sm:text-[9px] font-semibold text-sky-600 tracking-wider uppercase">
                Aviation Training
              </span>
            </div>
          </Link>

          {/* Menu Navigasi Tengah Berbentuk Kapsul (Pill Navbar - Khusus Desktop) */}
          <nav className="hidden md:flex items-center bg-slate-950/90 text-slate-200 px-6 py-2.5 rounded-full shadow-lg border border-slate-800/80 backdrop-blur-lg space-x-6 lg:space-x-8 text-sm font-medium">
            <a href="#prodi" className="hover:text-sky-400 transition-colors">
              Program Studi
            </a>
            <a href="#alur" className="hover:text-sky-400 transition-colors">
              Alur Pendaftaran
            </a>
            <a href="#syarat" className="hover:text-sky-400 transition-colors">
              Persyaratan
            </a>
            <a href="#faq" className="hover:text-sky-400 transition-colors">
              FAQ
            </a>
            <a href="#kontak" className="hover:text-sky-400 transition-colors">
              Kontak
            </a>
          </nav>

          {/* Tombol CTA & Login di Kanan (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-800 hover:text-slate-950 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-full shadow-md shadow-amber-500/30 transition-all flex items-center gap-1.5 group"
            >
              <span>Daftar</span>
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {/* Mobile Actions: Tombol Daftar Cepat di HP & Hamburger Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/register"
              className="px-3 py-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-full shadow-sm flex items-center gap-1"
            >
              <span>Daftar</span>
              <ArrowRight className="w-3 h-3" />
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl bg-slate-900/90 text-white backdrop-blur-md shadow-md border border-slate-800"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Glassy & Fleksibel di layar kecil) */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-3 right-3 bg-slate-900/98 text-white backdrop-blur-xl border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3 mt-2 animate-fade-in-up">
            <a
              href="#prodi"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-sm text-slate-300 hover:text-white border-b border-slate-800/60"
            >
              Program Studi
            </a>
            <a
              href="#alur"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-sm text-slate-300 hover:text-white border-b border-slate-800/60"
            >
              Alur Pendaftaran
            </a>
            <a
              href="#syarat"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-sm text-slate-300 hover:text-white border-b border-slate-800/60"
            >
              Persyaratan
            </a>
            <a
              href="#faq"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-sm text-slate-300 hover:text-white border-b border-slate-800/60"
            >
              FAQ
            </a>
            <a
              href="#kontak"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-sm text-slate-300 hover:text-white"
            >
              Kontak
            </a>

            <div className="pt-3 border-t border-slate-800 flex flex-col space-y-2">
              <Link
                href="/login"
                className="w-full text-center py-2.5 text-xs sm:text-sm font-semibold text-slate-200 bg-slate-800/80 rounded-xl"
              >
                Login Portal
              </Link>
              <Link
                href="/register"
                className="w-full text-center py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl flex items-center justify-center gap-1.5 shadow-md"
              >
                Daftar PMB Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>


      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-20 lg:py-28">
        {/* Video Background menggantikan pola radial-gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40"
          >
            <source src="/bg-hero.mp4" type="video/mp4" />
          </video>

          {/* Overlay gelap agar teks tetap jelas terbaca */}
          <div className="w-full h-full object-cover opacity-40"></div>
        </div>


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/80 border border-sky-800 text-sky-300 text-xs font-semibold">

                Penerimaan Mahasiswa Baru T.A 2026/2027
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight animate-fade-in-clean drop-shadow-md">
                Terbang Tinggi Bersama Karir Industri{' '}
                <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-amber-400 bg-clip-text text-transparent">
                  Penerbangan Dunia
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Kampus Mulia Angkasa Akademi membekali calon profesional bandara dan maskapai penerbangan dengan kurikulum berbasis standar internasional, lisensi keahlian resmi, dan garansi pendampingan kerja.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 animated-fade-in-up"
                style={{ animationDelay: '350ms' }}>
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-full shadow-xl shadow-amber-400/20 hover:shadow-amber-400/40 transition-all flex items-center justify-center gap-2 text-base"
                >
                  Daftar PMB Sekarang
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#prodi"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold rounded-full border border-slate-700 transition-all text-center text-base"
                >
                  Lihat Program Studi
                </a>
              </div>

              {/* Badges / Stats */}
              <div className="pt-10 grid grid-cols-2 sm:grid-cols-3 gap-6 border-t border-slate-800/80">
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-sky-400">95%</div>
                  <div className="text-xs text-slate-400 mt-1">Tingkat Serapan Kerja Alumni</div>
                </div>
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-amber-400">15+</div>
                  <div className="text-xs text-slate-400 mt-1">Mitra Maskapai & Bandara</div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-2xl lg:text-3xl font-bold text-emerald-400">Lisensi Resmi</div>
                  <div className="text-xs text-slate-400 mt-1">Personel Bandara Certified</div>
                </div>
              </div>
            </div>

            {/* Visual Banner Card with Photo Slider */}
            <div className="lg:col-span-5 relative">
              <div
                className="relative rounded-3xl overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 shadow-2xl group transition-all"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >


                {/* Carousel Photo Container */}
                <div className="relative w-full h-60 sm:h-64 rounded-xl overflow-hidden shadow-lg border border-sky-900/50 mb-4 bg-slate-950">
                  {/* Slides */}
                  {heroSlides.map((slide, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                        }`}
                    >
                      <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                      {/* Gradient overlay for better badge readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                      {/* Tag Badge */}
                      <div className="absolute top-3 left-3 z-20">
                        <span className="px-3 py-1 bg-slate-900/80 border border-sky-500/40 text-sky-300 text-xs font-semibold rounded-full backdrop-blur-md shadow-md">
                          {slide.tag}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevSlide}
                    aria-label="Previous Slide"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-950/60 hover:bg-sky-600/90 text-white backdrop-blur-md border border-slate-700/60 transition-all opacity-80 hover:opacity-100 hover:scale-110"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="Next Slide"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-950/60 hover:bg-sky-600/90 text-white backdrop-blur-md border border-slate-700/60 transition-all opacity-80 hover:opacity-100 hover:scale-110"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Dot Indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/60 backdrop-blur-md border border-slate-800">
                    {heroSlides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide
                          ? 'w-6 bg-amber-400'
                          : 'w-2 bg-slate-500 hover:bg-slate-300'
                          }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Informasi Teks Dynamic Di Bawah Photo Slider */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white transition-all duration-300">
                      {heroSlides[currentSlide].title}
                    </h3>
                    <p className="text-xs text-sky-300 mt-1 transition-all duration-300">
                      {heroSlides[currentSlide].subtitle}
                    </p>
                  </div>
                  <div className="text-xs text-slate-400 font-mono bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/80">
                    {currentSlide + 1} / {heroSlides.length}
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-full border border-slate-700/50">
                    <UserCheck className="w-5 h-5 text-sky-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-200">
                      Air Lines Crew (Pramugari/Staff Bandara)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-full border border-slate-700/50">
                    <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-200">
                      AVSEC (Aviation Security License)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Program Studi Section */}
      < section id="prodi" className="py-20 bg-white" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-sky-600 mb-2">
              PILIHAN JURUSAN UNGGULAN
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Program Studi Kampus Mulia Angkasa Akademi
            </p>
            <p className="text-slate-600 mt-4 text-base">
              Disusun secara komprehensif untuk membentuk lulusan yang siap langsung terjun ke industri penerbangan modern.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">


            {/* Card 1: Air Lines Crew */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-xl hover:border-sky-500/50 transition-all flex flex-col justify-between relative group">
              <div className="absolute top-6 right-6">
                <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-bold">
                  POPULAR
                </span>
              </div>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center mb-6 shadow-md shadow-sky-600/30">
                  <Plane className="w-8 h-8 transform -rotate-45" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  AirLines Crew (Pramugari / Pramugara & Staff Bandara)
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Program pendidikan khusus melatih calon cabin crew (pramugari/pramugara) serta ground handling staff penerbangan internasional dengan standar layanan penerbangan bintang lima.
                </p>
                <div className="space-y-2.5 mb-8">
                  <div className="flex items-center gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <span>Lisensi lembaga</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <span>Lisensi Awareness</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <span>Lisensi Beuty Class</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <span>Dibantu Penyaluran Kerja</span>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Biaya Pendidikan</span>
                  <span className="text-lg font-bold text-slate-900">Rp 22.975.000</span>
                </div>
                <Link
                  href="/register"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-full shadow transition-colors flex items-center gap-1.5"
                >
                  Pilih Prodi Ini
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 2: AVSEC */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-xl hover:border-amber-500/50 transition-all flex flex-col justify-between relative group">
              <div className="absolute top-6 right-6">
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                  LISENSI RESMI
                </span>
              </div>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mb-6 shadow-md shadow-amber-500/30">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  AVSEC (Aviation Security / Keamanan Bandara)
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Program bersertifikasi lisensi resmi keamanan penerbangan untuk menjadi personel AVSEC profesional penjaga keselamatan dan keamanan kawasan bandar udara.
                </p>
                <div className="space-y-2.5 mb-8">
                  <div className="flex items-center gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Lisensi Lembaga</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Lisensi AVSEC</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Lisensi Beuty Class</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Di Bantu Penyaluran Kerja</span>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Biaya Pendidikan</span>
                  <span className="text-lg font-bold text-slate-900">Rp 22.975.000</span>
                </div>
                <Link
                  href="/register"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-full shadow transition-colors flex items-center gap-1.5"
                >
                  Pilih Prodi Ini
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Alur Pendaftaran Section */}
      < section id="alur" className="py-20 bg-slate-900 text-white" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-amber-400 mb-2">
              ALUR SELEKSI PERGURUAN TINGGI
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              5 Langkah Praktis Pendaftaran PMB
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {[
              {
                step: '01',
                title: 'Buat Akun',
                desc: 'Registrasi akun calon mahasiswa menggunakan email & No. WhatsApp aktif.',
                icon: UserCheck,
              },
              {
                step: '02',
                title: 'Isi Formulir',
                desc: 'Lengkapi Data Pribadi, Pendidikan, dan Pilihan Program Studi.',
                icon: FileText,
              },
              {
                step: '03',
                title: 'Upload Dokumen',
                desc: 'Unggah berkas KTP, Ijazah/SKL, dan Pasfoto terbaru.',
                icon: BookOpen,
              },
              {
                step: '04',
                title: 'Verifikasi & Seleksi',
                desc: 'Tim panitia PMB akan memverifikasi berkas dan syarat fisik.',
                icon: ShieldCheck,
              },
              {
                step: '05',
                title: 'Cetak Bukti & Lulus',
                desc: 'Cetak Kartu Pendaftaran resmi dan ikuti petunjuk Daftar Ulang.',
                icon: Award,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 hover:border-amber-400/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-2xl font-black text-amber-400">{item.step}</span>
                    <div className="w-10 h-10 rounded-xl bg-slate-700/80 flex items-center justify-center text-sky-400">
                      <item.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* Persyaratan Section */}
      < section id="syarat" className="py-20 bg-slate-50" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-sky-600">
                SYARAT & KETENTUAN
              </h2>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Persyaratan Calon Mahasiswa Baru
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Pastikan Anda memenuhi kualifikasi umum di bawah ini sebelum melakukan pengisian formulir pendaftaran.
              </p>
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
                <h4 className="font-bold text-sm mb-1 flex items-center gap-2">

                  Catatan Penting:
                </h4>
                <p className="text-xs leading-relaxed">
                  Bagi lulusan tahun ini yang belum memiliki ijazah resmi, dapat menyertakan Surat Keterangan Lulus (SKL) dari sekolah.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-600" /> Syarat Fisik & Usia
                </h4>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Tinggi badan min. Putri: 160 cm, Putra: 168-170 cm
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Usia maksimal 23 tahun pada saat mendaftar
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Sehat jasmani & rohani, tidak buta warna
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" /> Dokumen Berkas
                </h4>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Pasfoto berwarna terbaru (Latar belakang Merah)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Scan KTP / Kartu Pelajar / KK
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Scan Ijazah SMA/SMK atau SKL sementara
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* FAQ Section */}
      < section id="faq" className="py-20 bg-white border-t border-slate-200" >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-sky-600 mb-2">
              PERTANYAAN POPULER
            </h2>
            <p className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-5 font-bold text-slate-900 bg-slate-50 hover:bg-slate-100 flex justify-between items-center text-sm sm:text-base"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 transition-transform ${openFaq === idx ? 'transform rotate-180 text-sky-600' : ''
                      }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="p-5 text-slate-600 text-sm bg-white border-t border-slate-100 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section >


      {/* Floating WhatsApp CTA */}
      <a
        href="https://wa.me/081255401558?text=Halo%20Kampus%20Mulia%20Angkasa,%20saya%20ingin%20bertanya%20mengenai%20PMB"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white h-14 w-14 hover:w-auto hover:px-5 rounded-full shadow-2xl shadow-emerald-500/40 hover:scale-105 transition-all duration-300 ease-in-out flex items-center justify-center gap-3 group overflow-hidden"
      >
        {/* Geser manual pakai translate-x dan translate-y agar benar-benar pas di tengah visual */}
        <MessageCircle className="w-7 h-7 flex-shrink-0 translate-x-1.5 translate-y-0.8" />

        <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap text-sm font-bold overflow-hidden">
          Chat WhatsApp Admin
        </span>
      </a>

      {/* Footer */}
      <footer id="kontak" className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">

                {/* Ganti bagian logo lama dengan tag <img> ini */}
                <img
                  src="/logo-mulia.png"
                  alt="Logo Mulia Angkasa Akademik"
                  className="w-15 h-15 object-contain"
                />

                <span className="text-sm font-extrabold text-white tracking-tight">
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
                <li><a href="#prodi" className="hover:text-amber-400">Pilihan Jurusan</a></li>
                <li><a href="#alur" className="hover:text-amber-400">Alur PMB Online</a></li>
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
                  <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span>Jl. Kesambi No.92, Kesambi, Kec. Kesambi, Kota Cirebon, Jawa Barat 45134</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span>muliaangkasaakademi@gmail.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span>081255401558</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-12 mt-12 border-t border-slate-900 text-center text-xs text-slate-500">
            © 2026 Kampus Mulia Angkasa Akademi. All rights reserved. Penerimaan Mahasiswa Baru System.
          </div>
        </div>
      </footer >
    </div >
  );
}
