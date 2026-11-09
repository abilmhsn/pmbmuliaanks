'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import {
  Crown,
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Building,
  GraduationCap,
  Activity,
  UserPlus,
  Sliders,
} from 'lucide-react';
import { useSuperAdminTheme } from '@/context/SuperAdminThemeContext';

export default function SuperAdminDashboardPage() {
  const { isDark } = useSuperAdminTheme();
  const [data, setData] = useState<any>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [togglingReg, setTogglingReg] = useState(false);

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [selectedPeriod]);

  const fetchPeriods = async () => {
    try {
      const res = await api.get('/pmb-periods');
      const list = Array.isArray(res.data) ? res.data : [];
      setPeriods(list);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const url = selectedPeriod
        ? `/super-admin/stats?periodId=${selectedPeriod}`
        : '/super-admin/stats';
      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching super admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRegistration = async () => {
    if (!data) return;
    const nextStatus = !data.isRegistrationOpen;
    const confirmMsg = nextStatus
      ? 'Buka kembali pendaftaran publik PMB Mulia Angkasa?'
      : 'Tutup sementara pendaftaran publik PMB? Calon mahasiswa baru tidak akan bisa mendaftar akun baru.';

    if (!window.confirm(confirmMsg)) return;

    try {
      setTogglingReg(true);
      await api.put('/super-admin/settings', {
        REGISTRATION_OPEN: nextStatus ? 'true' : 'false',
      });
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status pendaftaran');
    } finally {
      setTogglingReg(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-12">
      {/* Executive Welcome & Period Filter */}
      <div
        className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-colors ${isDark
          ? 'bg-slate-900 border-slate-800 shadow-2xl text-white'
          : 'bg-white border-slate-200/80 shadow-sm text-slate-900'
          }`}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isDark ? 'bg-purple-800 text-white' : 'bg-purple-100 text-purple-700'
                }`}
            >
              Executive PMB Console
            </span>
            <span
              className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'
                }`}
            >
              Kampus Mulia Angkasa Akademi
            </span>
          </div>
          <h1
            className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'
              }`}
          >
            Ikhtisar Eksekutif Penerimaan Mahasiswa Baru
          </h1>
          <p
            className={`text-xs mt-1 max-w-2xl leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
          >
            Pantau rekapitulasi finansial pendaftaran, capaian kuota program studi penerbangan,
            integritas verifikasi panitia, dan kontrol kebijakan global sistem PMB.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Filter Gelombang */}
          <div
            className={`rounded-2xl px-3 py-2 flex items-center gap-1.5 flex-1 sm:flex-none min-w-0 border transition-colors ${isDark
              ? 'bg-purple-900/60 border-purple-800 text-white'
              : 'bg-purple-50 border-purple-200 text-purple-900'
              }`}
          >
            <span
              className={`text-[11px] font-semibold whitespace-nowrap ${isDark ? 'text-purple-200' : 'text-purple-700'
                }`}
            >
              Gelombang:
            </span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer w-full sm:w-auto truncate"
            >
              <option
                value=""
                className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}
              >
                Semua Gelombang
              </option>
              {periods.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                  className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}
                >
                  {p.name} {p.isActive ? '(Aktif)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={fetchStats}
            className={`p-2.5 rounded-xl transition-colors flex-shrink-0 border ${isDark
              ? 'bg-purple-900/60 border-purple-800 hover:bg-slate-700 text-slate-100'
              : 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700'
              }`}
            title="Muat ulang data"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? 'animate-spin text-purple-500' : ''
                }`}
            />
          </button>
        </div>
      </div>

      {/* Global Status Banner & Emergency Switch */}
      <div
        className={`border p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${isDark
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-200/80 shadow-sm'
          }`}
      >
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-bold shadow-lg flex-shrink-0 ${data?.isRegistrationOpen
              ? isDark
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-emerald-500/10'
              : isDark
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-rose-500/10'
                : 'bg-rose-50 text-rose-600 border border-rose-200 shadow-rose-500/10'
              }`}
          >
            {data?.isRegistrationOpen ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
              >
                Status Portal PMB Publik:
              </span>
              <span
                className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${data?.isRegistrationOpen
                  ? isDark
                    ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isDark
                    ? 'bg-rose-400/10 text-rose-300 border border-rose-400/20'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
              >
                {data?.isRegistrationOpen ? 'Terbuka Untuk Umum' : 'Ditutup Sementara'}
              </span>
            </div>
            <p
              className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
            >
              {data?.isRegistrationOpen
                ? 'Calon mahasiswa dapat melakukan registrasi akun baru dan memilih program studi.'
                : 'Pendaftaran akun baru dinonaktifkan sementara. Calon mahasiswa yang sudah memiliki akun tetap dapat login.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleRegistration}
          disabled={togglingReg || loading}
          className={`w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 whitespace-nowrap flex-shrink-0 ${data?.isRegistrationOpen
            ? isDark
              ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
            }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{data?.isRegistrationOpen ? 'Tutup Pendaftaran' : 'Buka Pendaftaran'}</span>
        </button>
      </div>

      {/* Financial Metrics Cards */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-1 mb-3">
          <h2
            className={`text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'
              }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>Rekapitulasi Finansial & Penerimaan PMB</span>
          </h2>
          <span
            className={`text-[10px] sm:text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
          >
            Otomatis dari verifikasi pembayaran
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Card 1: Uang Formulir Masuk */}
          <div
            className={`border p-3.5 sm:p-5 rounded-2xl relative overflow-hidden group transition-all flex flex-col justify-between ${isDark
              ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/40'
              : 'bg-white border-slate-200/80 shadow-sm hover:border-emerald-500/40'
              }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] sm:text-xs font-bold truncate ${isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
              >
                Kas Formulir
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div
              className={`mt-2.5 sm:mt-3 text-sm sm:text-xl font-black truncate ${isDark ? 'text-emerald-400' : 'text-emerald-600'
                }`}
            >
              {formatRupiah(data?.financialMetrics?.verifiedAmount)}
            </div>
            <p
              className={`text-[10px] sm:text-[11px] mt-1 truncate ${isDark ? 'text-slate-500' : 'text-slate-500'
                }`}
            >
              <span
                className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
              >
                {data?.financialMetrics?.verifiedCount || 0}
              </span>{' '}
              lunas
            </p>
          </div>

          {/* Card 2: Uang Formulir Tertunda */}
          <div
            className={`border p-3.5 sm:p-5 rounded-2xl relative overflow-hidden group transition-all flex flex-col justify-between ${isDark
              ? 'bg-slate-900 border-slate-800 hover:border-amber-500/40'
              : 'bg-white border-slate-200/80 shadow-sm hover:border-amber-500/40'
              }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] sm:text-xs font-bold truncate ${isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
              >
                Tertunda
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div
              className={`mt-2.5 sm:mt-3 text-sm sm:text-xl font-black truncate ${isDark ? 'text-amber-300' : 'text-amber-600'
                }`}
            >
              {formatRupiah(data?.financialMetrics?.pendingAmount)}
            </div>
            <p
              className={`text-[10px] sm:text-[11px] mt-1 truncate ${isDark ? 'text-slate-500' : 'text-slate-500'
                }`}
            >
              <span
                className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'
                  }`}
              >
                {data?.financialMetrics?.pendingCount || 0}
              </span>{' '}
              transfer pending
            </p>
          </div>

          {/* Card 3: Potensi SPP Mahasiswa Diterima */}
          <div
            className={`border p-3.5 sm:p-5 rounded-2xl relative overflow-hidden group transition-all flex flex-col justify-between ${isDark
              ? 'bg-slate-900 border-slate-800 hover:border-purple-500/40'
              : 'bg-white border-slate-200/80 shadow-sm hover:border-purple-500/40'
              }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] sm:text-xs font-bold truncate ${isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
              >
                Potensi SPP
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div
              className={`mt-2.5 sm:mt-3 text-sm sm:text-xl font-black truncate ${isDark ? 'text-purple-300' : 'text-purple-600'
                }`}
            >
              {formatRupiah(data?.financialMetrics?.totalPotentialTuition)}
            </div>
            <p
              className={`text-[10px] sm:text-[11px] mt-1 truncate ${isDark ? 'text-slate-500' : 'text-slate-500'
                }`}
            >
              Estimasi daftar ulang
            </p>
          </div>

          {/* Card 4: Total Calon Mahasiswa */}
          <div
            className={`border p-3.5 sm:p-5 rounded-2xl relative overflow-hidden group transition-all flex flex-col justify-between ${isDark
              ? 'bg-slate-900 border-slate-800 hover:border-sky-500/40'
              : 'bg-white border-slate-200/80 shadow-sm hover:border-sky-500/40'
              }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] sm:text-xs font-bold truncate ${isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
              >
                Pendaftar
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center flex-shrink-0">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div
              className={`mt-2.5 sm:mt-3 text-base sm:text-2xl font-black ${isDark ? 'text-sky-400' : 'text-sky-600'
                }`}
            >
              {data?.applicantMetrics?.totalApplicants || 0}
            </div>
            <p
              className={`text-[10px] sm:text-[11px] mt-1 truncate ${isDark ? 'text-slate-500' : 'text-slate-500'
                }`}
            >
              Akun aktif di sistem
            </p>
          </div>
        </div>
      </div>

      {/* Program Studi Quota Fulfillment & User Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Kuota Prodi Penerbangan */}
        <div
          className={`lg:col-span-2 border rounded-2xl p-4 sm:p-6 transition-colors ${isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200/80 shadow-sm'
            }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3
                className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'
                  }`}
              >
                <Building className="w-4 h-4 text-purple-500" />
                <span>Keterisian Kuota Program Studi Penerbangan</span>
              </h3>
              <p
                className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
              >
                Target kapasitas per program keahlian Kampus Mulia Angkasa
              </p>
            </div>
            <Link
              href="/admin/master-data"
              className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-500 flex items-center gap-1"
            >
              <span>Ubah Kuota</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-4 sm:space-y-5">
            {data?.programFulfillment?.map((prog: any) => (
              <div
                key={prog.id}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all ${isDark
                  ? 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-2.5">
                  <div className="min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border mr-2 ${isDark
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}
                    >
                      {prog.code}
                    </span>
                    <span
                      className={`text-xs font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'
                        }`}
                    >
                      {prog.name}
                    </span>
                  </div>
                  <div className="text-left sm:text-right flex items-center sm:justify-end gap-1.5">
                    <span
                      className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-slate-900'
                        }`}
                    >
                      {prog.acceptedCount} / {prog.quota} Siswa
                    </span>
                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                      ({prog.percentageFilled}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'
                    }`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${prog.percentageFilled >= 90
                      ? 'bg-rose-500'
                      : prog.percentageFilled >= 50
                        ? 'bg-amber-400'
                        : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                      }`}
                    style={{ width: `${Math.min(100, prog.percentageFilled)}%` }}
                  />
                </div>

                <div
                  className={`grid grid-cols-3 gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] mt-2.5 pt-2 border-t text-center sm:text-left ${isDark
                    ? 'border-slate-800/60 text-slate-400'
                    : 'border-slate-200 text-slate-600'
                    }`}
                >
                  <div
                    className={`p-1.5 rounded-lg border sm:bg-transparent sm:p-0 sm:border-0 ${isDark
                      ? 'bg-slate-900/60 border-slate-800'
                      : 'bg-white border-slate-200/80 shadow-xs'
                      }`}
                  >
                    <span
                      className={`block text-[9px] sm:inline sm:text-[11px] ${isDark ? 'text-slate-500 sm:text-slate-400' : 'text-slate-500 sm:text-slate-600'
                        }`}
                    >
                      Peminat:{' '}
                    </span>
                    <span
                      className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}
                    >
                      {prog.totalRegistered}
                    </span>
                  </div>
                  <div
                    className={`p-1.5 rounded-lg border sm:bg-transparent sm:p-0 sm:border-0 ${isDark
                      ? 'bg-slate-900/60 border-slate-800'
                      : 'bg-white border-slate-200/80 shadow-xs'
                      }`}
                  >
                    <span
                      className={`block text-[9px] sm:inline sm:text-[11px] ${isDark ? 'text-slate-500 sm:text-slate-400' : 'text-slate-500 sm:text-slate-600'
                        }`}
                    >
                      Lulus:{' '}
                    </span>
                    <span
                      className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'
                        }`}
                    >
                      {prog.passedCount}
                    </span>
                  </div>
                  <div
                    className={`p-1.5 rounded-lg border sm:bg-transparent sm:p-0 sm:border-0 sm:text-right ${isDark
                      ? 'bg-slate-900/60 border-slate-800'
                      : 'bg-white border-slate-200/80 shadow-xs'
                      }`}
                  >
                    <span
                      className={`block text-[9px] sm:inline sm:text-[11px] ${isDark ? 'text-slate-500 sm:text-slate-400' : 'text-slate-500 sm:text-slate-600'
                        }`}
                    >
                      SPP:{' '}
                    </span>
                    <span
                      className={`font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}
                    >
                      {formatRupiah(prog.tuitionFee)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Ekosistem Akun Pengguna (DIUBAH DINAMIS) */}
        <div
          className={`border rounded-2xl p-4 sm:p-6 flex flex-col justify-between transition-colors ${isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200/80 shadow-sm'
            }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'
                  }`}
              >
                <Users className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                <span>Ekosistem Akun Pengguna</span>
              </h3>
              <Link
                href="/super-admin/users"
                className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-500"
              >
                Kelola
              </Link>
            </div>

            <div className="space-y-3">
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${isDark
                  ? 'bg-purple-950/40 border-purple-500/20 text-purple-300'
                  : 'bg-purple-50 border-purple-200 text-purple-900'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <div className="text-xs font-bold">Super Administrator</div>
                    <div
                      className={`text-[10px] ${isDark ? 'text-purple-200/70' : 'text-purple-700/70'
                        }`}
                    >
                      Pimpinan & Administrator Sistem
                    </div>
                  </div>
                </div>
                <span className="text-lg font-black">
                  {data?.userDemographic?.superAdminCount || 0}
                </span>
              </div>

              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${isDark
                  ? 'bg-amber-950/40 border-amber-500/20 text-amber-300'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <div>
                    <div className="text-xs font-bold">Admin Panitia PMB</div>
                    <div
                      className={`text-[10px] ${isDark ? 'text-amber-200/70' : 'text-amber-700/70'
                        }`}
                    >
                      Verifikator berkas & pembayaran
                    </div>
                  </div>
                </div>
                <span className="text-lg font-black">
                  {data?.userDemographic?.adminCount || 0}
                </span>
              </div>

              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${isDark
                  ? 'bg-sky-950/40 border-sky-500/20 text-sky-300'
                  : 'bg-sky-50 border-sky-200 text-sky-900'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <div>
                    <div className="text-xs font-bold">Akun Mahasiswa</div>
                    <div
                      className={`text-[10px] ${isDark ? 'text-sky-200/70' : 'text-sky-700/70'
                        }`}
                    >
                      Pengguna portal pendaftaran
                    </div>
                  </div>
                </div>
                <span className="text-lg font-black">
                  {data?.userDemographic?.applicantCount || 0}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`pt-4 border-t mt-4 transition-colors ${isDark ? 'border-slate-800' : 'border-slate-200'
              }`}
          >
            <Link
              href="/super-admin/users"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah / Kelola Akun Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Registration Funnel & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Funnel (Status Pendaftar) (DIUBAH DINAMIS) */}
        <div
          className={`border rounded-2xl p-4 sm:p-6 transition-colors ${isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200/80 shadow-sm'
            }`}
        >
          <h3
            className={`text-sm font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'
              }`}
          >
            <TrendingUp className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            <span>Status Corong Seleksi PMB</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div
              className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${isDark
                ? 'bg-slate-800/40 border-slate-800 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
            >
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Belum Lengkap</span>
              <span className="font-bold">{data?.applicantMetrics?.belumLengkap || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
              <span>Menunggu Verifikasi</span>
              <span className="font-black">{data?.applicantMetrics?.menungguVerifikasi || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
              <span>Berkas Diverifikasi</span>
              <span className="font-black">{data?.applicantMetrics?.diverifikasi || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
              <span>Lulus Seleksi</span>
              <span className="font-black">{data?.applicantMetrics?.lulusSeleksi || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
              <span>Daftar Ulang</span>
              <span className="font-black">{data?.applicantMetrics?.daftarUlang || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <span>Diterima Resmi</span>
              <span className="font-black">{data?.applicantMetrics?.diterima || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
              <span>Tidak Lolos / Ditolak</span>
              <span className="font-black">{data?.applicantMetrics?.ditolak || 0}</span>
            </div>
          </div>
        </div>

        {/* Audit Trail Preview (2 Cols) (DIUBAH DINAMIS) */}
        <div
          className={`lg:col-span-2 border rounded-2xl p-4 sm:p-6 transition-colors ${isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200/80 shadow-sm'
            }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'
                  }`}
              >
                <Activity className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                <span>Log Aktivitas & Audit Panitia Terbaru</span>
              </h3>
              <p
                className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
              >
                Integritas tindakan: memantau verifikasi berkas, pembayaran, dan perubahan status
              </p>
            </div>

            <Link
              href="/super-admin/audit-logs"
              className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-500 flex items-center gap-1"
            >
              <span>Semua Log</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {data?.recentAuditLogs?.length === 0 ? (
              <div
                className={`p-8 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
              >
                Belum ada aktivitas tercatat pada sistem.
              </div>
            ) : (
              data?.recentAuditLogs?.map((log: any) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs transition-colors ${isDark
                    ? 'bg-slate-800/40 border-slate-800 text-slate-300'
                    : 'bg-slate-50/70 border-slate-200 text-slate-800'
                    }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-700 dark:text-purple-300 uppercase">
                        {log.action}
                      </span>
                      <span
                        className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-900'
                          }`}
                      >
                        {log.target || 'Sistem'}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}
                    >
                      {log.details}
                    </p>
                    <p
                      className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'
                        }`}
                    >
                      Oleh:{' '}
                      <span
                        className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}
                      >
                        {log.userEmail || 'Sistem'}
                      </span>
                    </p>
                  </div>
                  <span
                    className={`text-[10px] flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-500'
                      }`}
                  >
                    {new Date(log.createdAt).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}