'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

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
      a: 'Untuk Air Lines Crew (Pramugari/Pramugara): Tinggi badan minimal Putri 158 cm, Putra 170 cm, penampilan menarik, tidak buta warna, dan sehat jasmani rohani. Untuk AVSEC: Tinggi badan minimal Putri 160 cm, Putra 168 cm, dan tidak bertato.',
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
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">

      {/* Header & Navbar - FIX MENEMPEL DI ATAS (FIXED) */}
      <header className="fixed top-0 left-0 right-0 z-[100] py-3 px-3 sm:px-6 lg:px-8 bg-slate-900 backdrop-blur-md border-b border-white/10 shadow-lg transition-all">
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
            <a href="#prodi" className="hover:text-amber-500 transition-colors">Program Studi</a>
            <a href="#alur" className="hover:text-amber-500 transition-colors">Alur Pendaftaran</a>
            <a href="#syarat" className="hover:text-amber-500 transition-colors">Persyaratan</a>
            <a href="#faq" className="hover:text-amber-500 transition-colors">FAQ</a>
            <a href="#kontak" className="hover:text-amber-500 transition-colors">Kontak</a>
          </nav>

          {/* Tombol CTA & Login */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-white hover:text-amber-400 transition-colors">
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
            <a href="#prodi" onClick={() => setIsMenuOpen(false)} className="block py-2 font-bold text-slate-300 hover:text-white border-b border-slate-800/60">Program Studi</a>
            <a href="#alur" onClick={() => setIsMenuOpen(false)} className="block py-2 text-sm text-slate-300 hover:text-white border-b border-slate-800/60">Alur Pendaftaran</a>
            <a href="#syarat" onClick={() => setIsMenuOpen(false)} className="block py-2 text-sm text-slate-300 hover:text-white border-b border-slate-800/60">Persyaratan</a>
            <a href="#faq" onClick={() => setIsMenuOpen(false)} className="block py-2 text-sm text-slate-300 hover:text-white border-b border-slate-800/60">FAQ</a>
            <a href="#kontak" onClick={() => setIsMenuOpen(false)} className="block py-2 text-sm text-slate-300 hover:text-white">Kontak</a>

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


      {/* Hero Section (Diberi pt-24 agar kontennya tidak tertutup header yang bersifat fixed) */}
      <section className="relative bg-slate-950 text-white overflow-hidden pt-32 pb-20 lg:py-28">
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source src="/bg-hero.mp4" type="video/mp4" />
          </video>
          <div className="w-full h-full object-cover opacity-40"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 5, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-10 lg:col-start-2 space-y-6 text-center"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400 border border-amber-500/20 text-slate-900 text-xs font-semibold mx-auto">
                Penerimaan Mahasiswa Baru T.A 2027/2028
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-amber-400 leading-tight drop-shadow-md">
                Terbang Tinggi Bersama Karir Industri{' '}
                <span className="bg-gradient-to-r from-white via-white to-amber-400 bg-clip-text text-transparent">
                  Penerbangan Dunia
                </span>
              </h1>

              <p className="text-base text-slate-100 max-w-2xl mx-auto font-normal leading-relaxed">
                Kampus Mulia Angkasa Akademi membekali calon profesional bandara dan maskapai penerbangan dengan kurikulum berbasis standar internasional, lisensi keahlian resmi, dan garansi pendampingan kerja.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-full shadow-xl transition-all flex items-center justify-center gap-2 text-base"
                >
                  Daftar PMB Sekarang
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#prodi"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold rounded-full border-slate-700 transition-all text-center text-base"
                >
                  Lihat Program Studi
                </a>
              </div>

              <div className="pt-10 grid grid-cols-2 sm:grid-cols-3 gap-6 border-t border-slate-800/80 text-center">
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-amber-400">95%</div>
                  <div className="text-xs text-slate-400 mt-1">Tingkat Serapan Kerja Alumni</div>
                </div>
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-amber-400">15+</div>
                  <div className="text-xs text-slate-400 mt-1">Mitra Maskapai & Bandara</div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-2xl lg:text-3xl font-bold text-amber-400">Lisensi Resmi</div>
                  <div className="text-xs text-slate-400 mt-1">Personel Bandara Certified</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Section 1: Penjelasan & Foto Airlines Crew & AVSEC */}
      <motion.section
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-4 text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                Pendidikan Keahlian Penerbangan & Keamanan Bandara
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Program pendidikan <strong className="text-slate-900">Air Lines Crew</strong> melatih calon pramugari, pramugara, dan staff darat bandara dengan standar pelayanan aviasi internasional.
              </p>
            </div>
            <div className="lg:col-span-6 flex items-center justify-center">
              <img
                src="/2.png"
                alt="Air Lines Crew Training"
                className="w-full max-w-xl h-auto object-contain drop-shadow-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 flex items-center justify-center order-2 lg:order-1">
              <img
                src="/avsecc.png"
                alt="AVSEC Training"
                className="w-full max-w-xl h-auto object-contain drop-shadow-xl"
              />
            </div>
            <div className="lg:col-span-6 space-y-4 text-left order-1 lg:order-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                Sertifikasi Resmi Aviation Security (AVSEC)
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Mencetak tenaga pengamanan bandara profesional yang memiliki lisensi resmi dan pemahaman mendalam mengenai standar keamanan penerbangan sipil.
              </p>
            </div>
          </div>
        </div>
      </motion.section>


      {/* Section 2: Program Studi */}
      <motion.section
        id="prodi"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 mb-2">
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
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-xl hover:border-slate-950 transition-all flex flex-col justify-between relative group">
              <div className="absolute top-6 right-6">
                <span className="px-3 py-1 bg-slate-950 text-white rounded-full text-xs font-bold">
                  POPULAR
                </span>
              </div>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white flex items-center justify-center mb-6 shadow-md shadow-sky-600/30">
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
                    <CheckCircle2 className="w-4 h-4 text-slate-950 flex-shrink-0" />
                    <span>Lisensi lembaga</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-slate-950 flex-shrink-0" />
                    <span>Lisensi Awareness</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-slate-950 flex-shrink-0" />
                    <span>Lisensi Beuty Class</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-slate-950 flex-shrink-0" />
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
                  className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-sm font-semibold rounded-full shadow transition-colors flex items-center gap-1.5"
                >
                  Pilih Prodi Ini
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-xl hover:border-amber-500/50 transition-all flex flex-col justify-between relative group">
              <div className="absolute top-6 right-6">
                <span className="px-3 py-1 bg-amber-400 text-slate-950 rounded-full text-xs font-bold">
                  LISENSI RESMI
                </span>
              </div>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mb-6 shadow-md shadow-slate-500/30">
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
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-semibold rounded-full shadow transition-colors flex items-center gap-1.5"
                >
                  Pilih Prodi Ini
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>


      {/* Section 3: Alur Pendaftaran */}
      <motion.section
        id="alur"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-20 bg-slate-900 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-amber-400 mb-2">
              ALUR SELEKSI PERGURUAN TINGGI
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              5 Langkah Praktis Pendaftaran PMB
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative text-slate-900">
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
                className="bg-slate-100 rounded-2xl p-6 border border-slate-700/80 hover:border-amber-400/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-2xl font-black text-slate-900">{item.step}</span>
                    <div className="w-10 h-10 rounded-xl bg-slate-700/80 flex items-center justify-center text-slate-900">
                      <item.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>


      {/* Section 4: Persyaratan */}
      <motion.section
        id="syarat"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-20 bg-slate-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-900">
                SYARAT & KETENTUAN
              </h2>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Persyaratan Calon Mahasiswa Baru
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Pastikan Anda memenuhi kualifikasi umum di bawah ini sebelum melakukan pengisian formulir pendaftaran.
              </p>
              <div className="p-6 bg-slate-900 border border-slate-200 rounded-2xl text-white">
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
                  <Users className="w-5 h-5 text-slate-900" /> Syarat Fisik & Usia
                </h4>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Tinggi badan min. Putri: 158 cm, Putra: 168-170 cm
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
                  <FileText className="w-5 h-5 text-slate-900" /> Dokumen Berkas
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
      </motion.section>


      {/* Section 5: FAQ */}
      <motion.section
        id="faq"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-20 bg-white border-t border-slate-200"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 mb-2">
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
                    className={`w-5 h-5 text-slate-500 transition-transform ${openFaq === idx ? 'transform rotate-180 text-sky-600' : ''}`}
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
      </motion.section>


      {/* Floating WhatsApp CTA */}
      <a
        href="https://wa.me/6281255401558?text=Halo%20Kampus%20Mulia%20Angkasa,%20saya%20ingin%20bertanya%20mengenai%20PMB"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-emerald-700 hover:bg-emerald-600 text-white h-14 w-14 hover:w-auto hover:px-5 rounded-full shadow-2xl shadow-emerald-500/40 hover:scale-105 transition-all duration-300 ease-in-out flex items-center justify-center gap-3 group overflow-hidden"
      >
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