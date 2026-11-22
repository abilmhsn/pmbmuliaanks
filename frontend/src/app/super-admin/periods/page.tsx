'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/lib/api';
import { useSuperAdminTheme } from '@/context/SuperAdminThemeContext';
import {
  CalendarRange,
  Plus,
  Edit2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Search,
  RefreshCw,
  X,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  Archive,
  ShieldAlert,
} from 'lucide-react';

interface PeriodItem {
  id: string;
  year: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    registrations: number;
  };
}

export default function SuperAdminPeriodsPage() {
  const { isDark } = useSuperAdminTheme();
  const [periods, setPeriods] = useState<PeriodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PeriodItem | null>(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Form State
  const [formYear, setFormYear] = useState('');
  const [formName, setFormName] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formIsActive, setFormIsActive] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch periods
  const fetchPeriods = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/pmb-periods/admin/all');
      setPeriods(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Failed to fetch PMB periods:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  // Unique academic years
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(periods.map((p) => p.year)));
    return years.sort((a, b) => b.localeCompare(a));
  }, [periods]);

  // Active period
  const activePeriod = useMemo(() => {
    return periods.find((p) => p.isActive) || null;
  }, [periods]);

  // Total stats
  const totalRegistrations = useMemo(() => {
    return periods.reduce((acc, p) => acc + (p._count?.registrations || 0), 0);
  }, [periods]);

  // Open modal create
  const handleOpenCreate = (presetYear?: string) => {
    setEditingPeriod(null);
    setFormYear(presetYear || (availableYears[0] || '2026/2027'));
    setFormName('');
    const today = new Date().toISOString().split('T')[0];
    setFormStartDate(today);
    setFormEndDate(today);
    setFormIsActive(periods.length === 0);
    setFormError('');
    setModalOpen(true);
  };

  // Open modal edit
  const handleOpenEdit = (item: PeriodItem) => {
    setEditingPeriod(item);
    setFormYear(item.year);
    setFormName(item.name);
    setFormStartDate(new Date(item.startDate).toISOString().split('T')[0]);
    setFormEndDate(new Date(item.endDate).toISOString().split('T')[0]);
    setFormIsActive(item.isActive);
    setFormError('');
    setModalOpen(true);
  };

  // Submit create / edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanYear = formYear.trim();
    const cleanName = formName.trim();

    if (!cleanYear || !cleanName) {
      setFormError('Tahun akademik dan nama gelombang wajib diisi.');
      return;
    }

    if (!/^\d{4}\/\d{4}$/.test(cleanYear)) {
      setFormError('Format tahun akademik harus YYYY/YYYY (contoh: 2026/2027).');
      return;
    }

    if (!formStartDate || !formEndDate) {
      setFormError('Tanggal mulai dan berakhir pendaftaran harus diisi.');
      return;
    }

    const start = new Date(formStartDate);
    const end = new Date(formEndDate);

    if (end < start) {
      setFormError('Tanggal berakhir pendaftaran tidak boleh sebelum tanggal mulai.');
      return;
    }

    try {
      setModalSubmitting(true);
      const payload = {
        year: cleanYear,
        name: cleanName,
        startDate: formStartDate,
        endDate: formEndDate,
        isActive: formIsActive,
      };

      if (editingPeriod) {
        await api.put(`/pmb-periods/${editingPeriod.id}`, payload);
        alert(`Gelombang ${cleanName} (T.A ${cleanYear}) berhasil diperbarui!`);
      } else {
        await api.post('/pmb-periods', payload);
        alert(`Gelombang ${cleanName} (T.A ${cleanYear}) berhasil ditambahkan!`);
      }

      setModalOpen(false);
      fetchPeriods();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan periode gelombang.');
    } finally {
      setModalSubmitting(false);
    }
  };

  // Handle single active wave activation
  const handleActivate = async (item: PeriodItem) => {
    const confirmText =
      `PERINGATAN SISTEM PMB:\n\n` +
      `Anda akan mengaktifkan "${item.name} (${item.year})".\n\n` +
      `Aturan Sistem:\n` +
      `1. Hanya ada 1 gelombang yang berstatus aktif secara global.\n` +
      `2. Pendaftar baru mulai saat ini otomatis masuk ke gelombang ini.\n` +
      `3. Arsip pendaftar pada gelombang sebelumnya tetap utuh dan tidak terhapus.\n\n` +
      `Lanjutkan aktivasi gelombang ini?`;

    if (!window.confirm(confirmText)) return;

    try {
      await api.put(`/pmb-periods/${item.id}/activate`);
      alert(`Sukses! ${item.name} (${item.year}) kini aktif sebagai periode penerimaan utama.`);
      fetchPeriods();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengaktifkan gelombang.');
    }
  };

  // Helper date formatter (Indonesian)
  const formatDateIndo = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Schedule status helper
  const getScheduleStatus = (item: PeriodItem) => {
    const now = new Date();
    const start = new Date(item.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(item.endDate);
    end.setHours(23, 59, 59, 999);

    if (now < start) {
      return {
        badgeText: 'Mendatang (Belum Dibuka)',
        badgeClass: isDark
          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          : 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-400',
        note: `Pendaftaran dibuka pada ${formatDateIndo(item.startDate)}`,
      };
    } else if (now > end) {
      return {
        badgeText: 'Jadwal Ditutup',
        badgeClass: isDark
          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          : 'bg-rose-50 text-rose-700 border-rose-200',
        dotClass: 'bg-rose-400',
        note: `Pendaftaran telah berakhir pada ${formatDateIndo(item.endDate)}`,
      };
    } else {
      return {
        badgeText: 'Pendaftaran Dibuka',
        badgeClass: isDark
          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-400',
        note: `Pendaftaran sedang berjalan hingga ${formatDateIndo(item.endDate)}`,
      };
    }
  };

  // Group periods by academic year
  const groupedPeriods = useMemo(() => {
    const groups: { [year: string]: PeriodItem[] } = {};

    periods.forEach((p) => {
      // Filter by selected year
      if (selectedYearFilter !== 'ALL' && p.year !== selectedYearFilter) {
        return;
      }
      // Filter by search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchYear = p.year.toLowerCase().includes(q);
        const matchName = p.name.toLowerCase().includes(q);
        if (!matchYear && !matchName) return;
      }

      if (!groups[p.year]) {
        groups[p.year] = [];
      }
      groups[p.year].push(p);
    });

    // Sort waves inside each year by startDate
    Object.keys(groups).forEach((y) => {
      groups[y].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    });

    // Return years sorted descending
    const sortedYears = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedYears.map((year) => ({
      year,
      items: groups[year],
    }));
  }, [periods, selectedYearFilter, search]);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Header Card */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border transition-colors ${
          isDark
            ? 'bg-[#0f172a] border-slate-800 text-white shadow-2xl'
            : 'bg-white border-slate-200 text-[#0f172a] shadow-sm'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CalendarRange className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Tahun Akademik &amp; Gelombang PMB
              </h1>
              <p
                className={`text-xs ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Atur kalender penerimaan mahasiswa baru, rentang tanggal pendaftaran, dan gelombang aktif kampus.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchPeriods()}
            disabled={loading}
            className={`p-2 rounded-xl border transition-all ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
            }`}
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => handleOpenCreate()}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Gelombang Baru</span>
          </button>
        </div>
      </div>

      {/* Highlights / Active Period Banner */}
      {activePeriod ? (
        <div
          className={`p-5 sm:p-6 rounded-2xl border relative overflow-hidden transition-all ${
            isDark
              ? 'bg-gradient-to-br from-emerald-950/40 via-[#0f172a] to-[#0f172a] border-emerald-500/30 shadow-xl'
              : 'bg-gradient-to-br from-emerald-50 via-white to-white border-emerald-200 shadow-sm'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                  GELOMBANG AKTIF GLOBAL
                </span>
                <span
                  className={`text-xs font-mono font-semibold ${
                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  T.A {activePeriod.year}
                </span>
              </div>

              <div>
                <h2
                  className={`text-2xl font-black tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {activePeriod.name}
                </h2>
                <div
                  className={`flex flex-wrap items-center gap-3 text-xs mt-1 ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    {formatDateIndo(activePeriod.startDate)} &ndash; {formatDateIndo(activePeriod.endDate)}
                  </span>
                  <span>&bull;</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <strong>{activePeriod._count?.registrations || 0}</strong> Pendaftar Terdaftar
                  </span>
                </div>
              </div>

              {/* Status Real-Time Jadwal */}
              <div className="pt-1">
                {(() => {
                  const schedule = getScheduleStatus(activePeriod);
                  return (
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${schedule.badgeClass}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${schedule.dotClass}`} />
                        {schedule.badgeText}
                      </span>
                      <span
                        className={`text-xs ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {schedule.note}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center">
              <button
                onClick={() => handleOpenEdit(activePeriod)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Ubah Jadwal</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`p-4 rounded-2xl border flex items-center space-x-3 ${
            isDark
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400" />
          <p className="text-xs leading-relaxed">
            <strong>Pemberitahuan:</strong> Belum ada gelombang PMB yang berstatus <strong>Aktif</strong>. Pendaftar baru tidak akan dapat menyelesaikan formulir pendaftaran sampai ada salah satu gelombang yang diaktifkan oleh Super Admin.
          </p>
        </div>
      )}

      {/* Metric Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          className={`p-4 rounded-2xl border transition-colors ${
            isDark
              ? 'bg-[#0f172a] border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-800 shadow-xs'
          }`}
        >
          <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Tahun Akademik
          </p>
          <p className="text-2xl font-black mt-1">{availableYears.length}</p>
          <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Periode terdata
          </p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-colors ${
            isDark
              ? 'bg-[#0f172a] border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-800 shadow-xs'
          }`}
        >
          <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Total Gelombang
          </p>
          <p className="text-2xl font-black mt-1">{periods.length}</p>
          <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Keseluruhan histori
          </p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-colors ${
            isDark
              ? 'bg-[#0f172a] border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-800 shadow-xs'
          }`}
        >
          <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Gelombang Aktif
          </p>
          <p className="text-2xl font-black mt-1 text-emerald-500">
            {activePeriod ? '1' : '0'}
          </p>
          <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {activePeriod ? activePeriod.name : 'Tidak ada'}
          </p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-colors ${
            isDark
              ? 'bg-[#0f172a] border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-800 shadow-xs'
          }`}
        >
          <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Pendaftar Terikat
          </p>
          <p className="text-2xl font-black mt-1 text-sky-400">{totalRegistrations}</p>
          <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Total arsip pendaftaran
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDark
            ? 'bg-[#0f172a] border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-800 shadow-xs'
        }`}
      >
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari gelombang / tahun..."
            className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
            }`}
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span
            className={`text-xs whitespace-nowrap font-medium ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Filter Tahun:
          </span>
          <select
            value={selectedYearFilter}
            onChange={(e) => setSelectedYearFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-xl text-xs border font-semibold focus:outline-none focus:ring-1 focus:ring-amber-400 ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-amber-400'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="ALL">Semua Tahun Akademik</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                T.A {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grouped Periods List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400">Memuat data tahun akademik dan gelombang PMB...</p>
        </div>
      ) : groupedPeriods.length === 0 ? (
        <div
          className={`py-16 text-center rounded-2xl border space-y-3 ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <CalendarRange className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold">Tidak ada gelombang ditemukan</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search
              ? 'Tidak ada data gelombang atau tahun akademik yang sesuai dengan kata kunci pencarian.'
              : 'Belum ada tahun akademik yang dibuat. Mulai dengan membuat tahun akademik baru.'}
          </p>
          <button
            onClick={() => handleOpenCreate()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Buat Gelombang Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedPeriods.map(({ year, items }) => {
            const hasActiveWave = items.some((i) => i.isActive);
            const yearRegistrations = items.reduce(
              (acc, i) => acc + (i._count?.registrations || 0),
              0
            );

            return (
              <div
                key={year}
                className={`rounded-2xl border overflow-hidden transition-all ${
                  isDark
                    ? 'bg-[#0f172a] border-slate-800 shadow-xl'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                {/* Academic Year Group Header */}
                <div
                  className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-base sm:text-lg font-black tracking-tight">
                          Tahun Akademik {year}
                        </h2>
                        {hasActiveWave ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Aktif Berjalan
                          </span>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              isDark
                                ? 'bg-slate-800 text-slate-400 border-slate-700'
                                : 'bg-slate-200 text-slate-600 border-slate-300'
                            }`}
                          >
                            Arsip
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {items.length} Gelombang &bull; Total {yearRegistrations} Pendaftar
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenCreate(year)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all self-start sm:self-center ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tambah Gelombang ({year})</span>
                  </button>
                </div>

                {/* Waves Table / List */}
                <div className="divide-y divide-slate-800/40">
                  {items.map((wave) => {
                    const schedule = getScheduleStatus(wave);

                    return (
                      <div
                        key={wave.id}
                        className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                          wave.isActive
                            ? isDark
                              ? 'bg-emerald-950/10'
                              : 'bg-emerald-50/40'
                            : isDark
                              ? 'hover:bg-slate-800/40'
                              : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold tracking-tight">
                              {wave.name}
                            </h3>

                            {wave.isActive ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                                <CheckCircle2 className="w-3 h-3" />
                                AKTIF GLOBAL
                              </span>
                            ) : (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                  isDark
                                    ? 'bg-slate-800 text-slate-400 border-slate-700'
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}
                              >
                                Non-Aktif
                              </span>
                            )}

                            {/* Schedule Status Badge */}
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${schedule.badgeClass}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${schedule.dotClass}`} />
                              {schedule.badgeText}
                            </span>
                          </div>

                          <div
                            className={`flex flex-wrap items-center gap-3 text-xs ${
                              isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          >
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-amber-400" />
                              {formatDateIndo(wave.startDate)} s/d {formatDateIndo(wave.endDate)}
                            </span>
                            <span>&bull;</span>
                            <span className="inline-flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-sky-400" />
                              <strong>{wave._count?.registrations || 0}</strong> Pendaftar
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 self-start md:self-center shrink-0">
                          {!wave.isActive && (
                            <button
                              onClick={() => handleActivate(wave)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                            >
                              Jadikan Gelombang Aktif
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEdit(wave)}
                            className={`p-2 rounded-xl border transition-all ${
                              isDark
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                            }`}
                            title="Edit Gelombang"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog (Create & Edit) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all ${
              isDark
                ? 'bg-[#0f172a] border-slate-800 text-white'
                : 'bg-white border-slate-200 text-[#0f172a]'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`p-4 sm:p-5 border-b flex items-center justify-between ${
                isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <CalendarRange className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold">
                    {editingPeriod ? 'Ubah Periode & Gelombang PMB' : 'Tambah Periode & Gelombang Baru'}
                  </h3>
                  <p
                    className={`text-[11px] ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Atur tahun akademik, nama gelombang, dan rentang tanggal pendaftaran.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-4 sm:p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Input Tahun Akademik */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold">
                  Tahun Akademik <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formYear}
                  onChange={(e) => setFormYear(e.target.value)}
                  placeholder="Contoh: 2026/2027"
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
                <p
                  className={`text-[10px] ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Gunakan format <strong>YYYY/YYYY</strong> (misal 2026/2027 atau 2027/2028).
                </p>
              </div>

              {/* Input Nama Gelombang */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold">
                  Nama Gelombang <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Gelombang I atau Gelombang 2"
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
              </div>

              {/* Rentang Tanggal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold">
                    Tanggal Mulai Pendaftaran <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold">
                    Tanggal Berakhir Pendaftaran <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Checkbox Jadikan Aktif */}
              <div
                className={`p-3 rounded-xl border flex items-start space-x-3 transition-colors ${
                  isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  id="formIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="mt-0.5 rounded border-slate-600 text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
                <label htmlFor="formIsActive" className="text-xs cursor-pointer select-none">
                  <span className="font-semibold block">Jadikan sebagai Gelombang Aktif</span>
                  <span
                    className={`text-[10px] block mt-0.5 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Jika dicentang, gelombang aktif saat ini akan otomatis dinonaktifkan. Seluruh pendaftar baru akan diarahkan ke gelombang ini.
                  </span>
                </label>
              </div>

              {/* Modal Actions */}
              <div
                className={`pt-3 border-t flex items-center justify-end space-x-2.5 ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={modalSubmitting}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                  }`}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {modalSubmitting ? 'Menyimpan...' : editingPeriod ? 'Simpan Perubahan' : 'Buat Gelombang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
