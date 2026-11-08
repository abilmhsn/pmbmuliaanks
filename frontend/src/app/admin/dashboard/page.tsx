'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import {
  Users,
  UserPlus,
  Clock,
  CheckCircle2,
  Award,
  UserCheck,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  RefreshCw,
  Activity,
} from 'lucide-react';

// Komponen SVG Geometric Pattern (Motif Geometris Footer Card)
const GeometricMosaicFooter = ({ colors }: { colors: { bg: string; c1: string; c2: string; c3: string; c4: string } }) => {
  return (
    <div className="w-full h-12 overflow-hidden rounded-b-2xl border-t border-slate-200/60 mt-4">
      <svg
        viewBox="0 0 360 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover"
        preserveAspectRatio="none"
      >
        {/* Background Tile Strip */}
        <rect width="360" height="48" fill={colors.bg} />

        {/* Tile 1: Quarter Circle */}
        <rect x="0" y="0" width="60" height="48" fill={colors.c1} />
        <path d="M 0 48 A 48 48 0 0 1 48 0 L 0 0 Z" fill={colors.c4} />
        <circle cx="20" cy="30" r="12" fill={colors.c2} />

        {/* Tile 2: Solid Center Circle */}
        <rect x="60" y="0" width="60" height="48" fill={colors.c2} />
        <circle cx="90" cy="24" r="18" fill={colors.bg} />

        {/* Tile 3: 4-Petal Flower Motif */}
        <rect x="120" y="0" width="60" height="48" fill={colors.c1} />
        <path
          d="M 150 0 C 150 15, 135 24, 120 24 C 135 24, 150 33, 150 48 C 150 33, 165 24, 180 24 C 165 24, 150 15, 150 0 Z"
          fill={colors.bg}
        />

        {/* Tile 4: Split Diagonals & Block */}
        <rect x="180" y="0" width="60" height="48" fill={colors.c3} />
        <polygon points="180,0 240,48 180,48" fill={colors.c4} />

        {/* Tile 5: Triangular Split */}
        <rect x="240" y="0" width="60" height="48" fill={colors.c2} />
        <polygon points="240,48 300,0 300,48" fill={colors.c1} />
        <polygon points="240,0 270,24 240,48" fill={colors.bg} />

        {/* Tile 6: Mosaic Shapes */}
        <rect x="300" y="0" width="60" height="48" fill={colors.c4} />
        <polygon points="300,0 360,48 360,0" fill={colors.c2} />
        <polygon points="330,24 360,48 300,48" fill={colors.c3} />
      </svg>
    </div>
  );
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Ambil daftar Gelombang PMB
  const fetchPeriods = async () => {
    try {
      const res = await api.get('/pmb-periods');
      const list = Array.isArray(res.data) ? res.data : [];
      setPeriods(list);
      const active = list.find((p: any) => p.isActive);
      if (active) {
        setSelectedPeriod(active.id);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar gelombang:', err);
    }
  };

  // Ambil data Statistik dengan AbortController
  const fetchStats = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const url = selectedPeriod
        ? `/admin/stats?periodId=${selectedPeriod}`
        : '/admin/stats';
      const res = await api.get(url, { signal });
      setStats(res.data);
    } catch (err: any) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        console.error('Gagal mengambil statistik:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchStats(controller.signal);
    return () => controller.abort();
  }, [fetchStats]);

  // Handler Export CSV
  const handleExportCsv = async () => {
    try {
      const token = localStorage.getItem('pmb_token');
      const urlQuery = selectedPeriod ? `?periodId=${selectedPeriod}` : '';
      const response = await fetch(`http://localhost:5000/api/admin/export-csv${urlQuery}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Export CSV gagal');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Data_Pendaftar_PMB_Gelombang_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error export:', error);
      alert('Gagal mengunduh file CSV.');
    }
  };

  // Konfigurasi 6 Card Tanpa Top Pill (Warna Masing-Masing Tetap Presisi)
  const statCards = [
    {
      title: 'TOTAL PENDAFTARAN',
      value: stats?.totalApplicants ?? 0,
      desc: 'akumulasi calon mahasiswa',
      icon: Users,
      badge: 'Basis Data',
      iconBoxBg: 'bg-slate-900 text-blue-50 border border-slate-50',
      pillDescBg: 'bg-slate-900 text-blue-50 border-slate-900',
      pillBadgeBg: 'bg-slate-900 text-blue-50  font-bold',
      mosaicColors: {
        bg: '#0f172a',
        c1: '#93c5fd',
        c2: '#3b82f6',
        c3: '#0c2635ff',
        c4: '#1e3a8a',
      },
    },
    {
      title: 'PENDAFTAR BARU (7 HARI)',
      value: stats?.newApplicants ?? 0,
      desc: 'Registrasi minggu ini',
      icon: UserPlus,
      badge: 'Tren Aktif',
      iconBoxBg: 'bg-slate-900 text-emerald-50  ',
      pillDescBg: 'bg-slate-900 text-emerald-50 ',
      pillBadgeBg: 'bg-slate-900 text-emerald-50 font-bold',
      mosaicColors: {
        bg: '#0f172a',
        c1: '#6ee7b7',
        c2: '#10b981',
        c3: '#0c2635ff',
        c4: '#064e3b',
      },
    },
    {
      title: 'MENUNGGU VERIFIKASI',
      value: stats?.pendingVerification ?? 0,
      desc: 'Berkas perlu diperiksa admin',
      icon: Clock,
      badge: 'Butuh Aksi',
      iconBoxBg: 'bg-slate-900 text-amber-50 ',
      pillDescBg: 'bg-slate-900 text-amber-50 ',
      pillBadgeBg: 'bg-slate-900 text-amber-50 font-bold',
      mosaicColors: {
        bg: '#0f172a',
        c1: '#fcd34d',
        c2: '#f59e0b',
        c3: '#0c2635ff',
        c4: '#78350f',
      },
    },
    {
      title: 'SUDAH DIVERIFIKASI',
      value: stats?.verified ?? 0,
      desc: 'Berkas telah dinyatakan valid',
      icon: CheckCircle2,
      badge: 'Terverifikasi',
      iconBoxBg: 'bg-slate-900 text-sky-50 ',
      pillDescBg: 'bg-slate-900 text-sky-50 ',
      pillBadgeBg: 'bg-slate-900 text-sky-50  font-bold',
      mosaicColors: {
        bg: '#0f172a',
        c1: '#7dd3fc',
        c2: '#0e4863ff',
        c3: '#0c2635ff',
        c4: '#0f172a',
      },
    },
    {
      title: 'LULUS SELEKSI',
      value: stats?.passed ?? 0,
      desc: 'Lulus ujian & kualifikasi PMB',
      icon: Award,
      badge: 'Lulus Seleksi',
      iconBoxBg: 'bg-slate-900 text-purple-50 ',
      pillDescBg: 'bg-slate-900 text-purple-50 ',
      pillBadgeBg: 'bg-slate-900 text-purple-50  font-bold',
      mosaicColors: {
        bg: '#0f172a',
        c1: '#d8b4fe',
        c2: '#a855f7',
        c3: '#0c2635ff',
        c4: '#581c87',
      },
    },
    {
      title: 'DAFTAR ULANG / DITERIMA',
      value: stats?.reRegistered ?? 0,
      desc: 'Mahasiswa resmi PMB',
      icon: UserCheck,
      badge: 'Resmi Diterima',
      iconBoxBg: 'bg-slate-900 text-teal-50 border border-teal-50',
      pillDescBg: 'bg-slate-900 text-teal-50 border-teal-50',
      pillBadgeBg: 'bg-slate-900 text-teal-50  font-bold',
      mosaicColors: {
        bg: '#0f172a',
        c1: '#5eead4',
        c2: '#14b8a6',
        c3: '#0c2635ff',
        c4: '#134e4a',
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-0">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20">
              PANITIA PMB KAMPUS MULIA ANGKASA
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Dashboard Statistik Administrator</h1>
          <p className="text-xs text-slate-400 mt-1">
            Ringkasan data real-time pendaftaran calon mahasiswa baru per-gelombang.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Dropdown Filter Gelombang */}
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2.5 rounded-2xl border border-slate-800">
            <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-amber-400 font-bold text-xs focus:outline-none cursor-pointer w-full"
            >
              <option value="" className="bg-slate-900 text-slate-200">Semua Gelombang</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-amber-400">
                  {p.name} {p.isActive ? '(AKTIF)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Tombol Export CSV */}
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV Gelombang
          </button>
        </div>
      </div>

      {/* 6 CARD GRID - CLEAN & MINIMALIST (TANPA TOP PILL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-300/80 shadow-md hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 pt-5 flex flex-col justify-between overflow-hidden"
            >
              <div className="px-5">
                {/* Content Row: Title & Icon */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-black text-slate-700 tracking-wider uppercase block">
                      {card.title}
                    </span>
                    {/* Metric Value */}
                    {loading ? (
                      <div className="h-12 w-20 bg-slate-100 animate-pulse rounded-xl my-2" />
                    ) : (
                      <span className="text-5xl font-black text-slate-900 font-mono tracking-tight block my-2">
                        {card.value.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>

                  {/* Icon Container in Rounded Pill Box */}
                  <div className={`p-4 rounded-2xl shadow-sm ${card.iconBoxBg}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                </div>

                {/* Dual Pill Row (Kapsul Keterangan & Badge di Bawah) */}
                <div className="flex items-center justify-between gap-2 mt-4">
                  {/* Left Pill: Description */}
                  <span className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold border truncate max-w-[65%] ${card.pillDescBg}`}>
                    {card.desc}
                  </span>

                  {/* Right Pill: Badge Status */}
                  <span className={`px-3.5 py-1.5 rounded-full text-[11px] border shrink-0 ${card.pillBadgeBg}`}>
                    {card.badge}
                  </span>
                </div>
              </div>

              {/* Geometric Mosaic Pattern Bar (Batik Geometris di Dasar Card) */}
              <GeometricMosaicFooter colors={card.mosaicColors} />
            </div>
          );
        })}
      </div>

      {/* BOTTOM SECTION: Trend Chart & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tren 7 Hari Terakhir */}
        <div className="lg:col-span-1 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Tren Pendaftaran (7 Hari)</h3>
              </div>
              <button
                onClick={() => fetchStats()}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
                title="Refresh Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-6 bg-slate-800 animate-pulse rounded-md" />
                ))}
              </div>
            ) : stats?.trend && stats.trend.length > 0 ? (
              <div className="space-y-3">
                {stats.trend.map((t: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">{t.date}</span>
                    <div className="flex items-center gap-2 flex-1 mx-3">
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              (t.count / Math.max(...stats.trend.map((x: any) => x.count || 1))) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="font-bold text-white font-mono">{t.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">Belum ada grafik tren minggu ini.</p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-[11px] text-slate-400">
            <span>Total Program Studi Aktif</span>
            <span className="font-bold text-amber-400 font-mono">{stats?.totalStudyPrograms ?? 0} Prodi</span>
          </div>
        </div>

        {/* Pendaftar Terbaru */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white">Aktivitas Pendaftaran Terbaru</h3>
            </div>
            <span className="text-[11px] text-slate-400">5 Pendaftar Terakhir</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Nama Mahasiswa</th>
                  <th className="p-3.5">Program Studi</th>
                  <th className="p-3.5">Tanggal Daftar</th>
                  <th className="p-3.5 text-right rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500">
                      Memuat aktivitas terbaru...
                    </td>
                  </tr>
                ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((act: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-white">{act.name}</td>
                      <td className="p-3.5 text-sky-400 font-medium">{act.program}</td>
                      <td className="p-3.5 text-slate-400">{act.date}</td>
                      <td className="p-3.5 text-right">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${act.status === 'DITERIMA' || act.status === 'LULUS_SELEKSI'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : act.status === 'DIVERIFIKASI'
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                        >
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500">
                      Belum ada pendaftaran terbaru.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}