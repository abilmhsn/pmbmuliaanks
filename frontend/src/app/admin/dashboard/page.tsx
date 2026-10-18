'use client';

import React, { useState, useEffect } from 'react'
import api from '@/lib/api';
import {
  Users,
  UserPlus,
  Clock,
  CheckCircle2,
  Award,
  CreditCard,
  FileSpreadsheet,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi export CSV pakai fetch & token yang benar (Bebas Error 401)
  const handleExportCsv = async () => {
    try {
      const token = localStorage.getItem('pmb_token');

      const response = await fetch('http://localhost:5000/api/admin/export-csv', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        alert('Sesi Anda telah habis, silakan login ulang.');
        return;
      }

      if (!response.ok) {
        throw new Error('Gagal mendownload data CSV.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Data_Pendaftar_PMB_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error export:', error);
      alert('Terjadi kesalahan saat mengexport data.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Pendaftar',
      value: stats?.totalApplicants || 0,
      icon: Users,
      color: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    },
    {
      title: 'Pendaftar Baru (7 Hari)',
      value: stats?.newApplicants || 0,
      icon: UserPlus,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      title: 'Menunggu Verifikasi',
      value: stats?.pendingVerification || 0,
      icon: Clock,
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      title: 'Sudah Diverifikasi',
      value: stats?.verified || 0,
      icon: CheckCircle2,
      color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    },
    {
      title: 'Lulus Seleksi',
      value: stats?.passed || 0,
      icon: Award,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
    {
      title: 'Daftar Ulang',
      value: stats?.reRegistered || 0,
      icon: CreditCard,
      color: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            PANITIA PMB KAMPUS MULIA ANGKASA
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Dashboard Statistik Administrator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ringkasan statistik real-time pendaftaran calon mahasiswa baru T.A 2026/2027.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Data Pendaftar (.CSV)
          </button>
        </div>
      </div>

      {/* Grid Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-4"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400">{card.title}</span>
              <div className={`p-3 rounded-xl border ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <Link
          href="/admin/applicants"
          className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-amber-400/50 transition-all flex justify-between items-center group"
        >
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
              Kelola & Verifikasi Pendaftar
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Lihat tabel data pendaftar, pencarian, verifikasi dokumen, dan ubah status pendaftaran.
            </p>
          </div>
          <ArrowUpRight className="w-6 h-6 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </Link>

        <Link
          href="/admin/master-data"
          className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-sky-400/50 transition-all flex justify-between items-center group"
        >
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">
              Kelola Master Data & Periode PMB
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Atur kuota program studi Air Lines Crew & AVSEC, periode PMB aktif, dan pengumuman.
            </p>
          </div>
          <ArrowUpRight className="w-6 h-6 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </Link>
      </div>
    </div>
  );
}