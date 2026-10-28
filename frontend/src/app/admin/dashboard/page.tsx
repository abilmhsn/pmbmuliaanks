'use client';

import React, { useState, useEffect } from 'react';
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
  TrendingUp,
  PieChart as PieIcon,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('7days');

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

  // Data untuk Donut Chart Status berdasarkan statistik nyata
  const statusDistributionData = [
    { name: 'Menunggu Verifikasi', value: stats?.pendingVerification || 0, color: '#f59e0b' },
    { name: 'Sudah Diverifikasi', value: stats?.verified || 0, color: '#6366f1' },
    { name: 'Lulus Seleksi', value: stats?.passed || 0, color: '#4e0692ff' },
    { name: 'Daftar Ulang', value: stats?.reRegistered || 0, color: '#14b8a6' },
  ].filter(item => item.value > 0);

  const trendData = stats?.trend || [];
  const recentActivity = stats?.recentActivity || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
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
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Data Pendaftar (.CSV)
          </button>
        </div>
      </div>

      {/* Konten Utama & Loading ditangani di dalam struktur, TANPA early return */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh] bg-slate-900/50 rounded-2xl border border-slate-800">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-medium">Memuat statistik dashboard...</p>
          </div>
        </div>
      ) : (
        <>
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

          {/* Area Visualisasi Grafik */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* A. Grafik Tren Pendaftaran (Area Chart) */}
            <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                    Tren Pendaftaran Calon Mahasiswa
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Grafik jumlah pendaftar berdasarkan rentang waktu</p>
                </div>

                {/* Filter Waktu Sederhana */}
                <div className="inline-flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setTimeFilter('7days')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${timeFilter === '7days' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    7 Hari Terakhir
                  </button>
                </div>
              </div>

              <div className="h-72 w-full">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPendaftar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                      />
                      <Area type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorPendaftar)" name="Pendaftar" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                    <Activity className="w-8 h-8 mb-2 opacity-40 text-amber-400" />
                    Belum ada data tren yang cukup untuk ditampilkan.
                  </div>
                )}
              </div>
            </div>

            {/* B. Grafik Distribusi Status Pendaftar (Donut Chart) */}
            <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                  <PieIcon className="w-5 h-5 text-sky-400" />
                  Distribusi Status
                </h2>
                <p className="text-xs text-slate-400">Proporsi status pendaftar saat ini</p>
              </div>

              <div className="h-56 w-full my-2 flex items-center justify-center">
                {statusDistributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-slate-500 text-xs text-center">Data status belum tersedia</div>
                )}
              </div>

              {/* Legenda Status */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                {statusDistributionData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* C. Ringkasan Aktivitas Terbaru */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Aktivitas Pendaftaran Terbaru
                </h2>
                <p className="text-xs text-slate-400">Daftar calon mahasiswa yang baru saja mendaftar ke sistem</p>
              </div>

              <Link
                href="/admin/applicants"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                <span>Kelola Semua Pendaftar</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                    <th className="py-3 px-4">Nama Calon Mahasiswa</th>
                    <th className="py-3 px-4">Program Studi</th>
                    <th className="py-3 px-4">Tanggal Daftar</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">{item.name}</td>
                        <td className="py-3.5 px-4 text-slate-300">{item.program}</td>
                        <td className="py-3.5 px-4 text-slate-400">{item.date}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        Belum ada riwayat aktivitas pendaftaran baru yang tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
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
        </>
      )}
    </div>
  );
}