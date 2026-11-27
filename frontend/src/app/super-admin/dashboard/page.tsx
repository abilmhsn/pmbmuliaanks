'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import {
  Crown,
  Users,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  Building,
  Activity,
  UserPlus,
  X,
  Search,
  Calendar,
  Receipt,
} from 'lucide-react';
import { useSuperAdminTheme } from '@/context/SuperAdminThemeContext';

export default function SuperAdminDashboardPage() {
  const { isDark } = useSuperAdminTheme();
  const [data, setData] = useState<any>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // State khusus Pop-up Rincian Uang Muka
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalType, setPaymentModalType] = useState<'VERIFIED' | 'PENDING'>('VERIFIED');
  const [paymentSearch, setPaymentSearch] = useState('');

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

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [selectedPeriod]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const openPaymentModal = (type: 'VERIFIED' | 'PENDING') => {
    setPaymentModalType(type);
    setPaymentSearch('');
    setPaymentModalOpen(true);
  };

  const allTransactions = useMemo(() => {
    return Array.isArray(data?.financialMetrics?.transactions)
      ? data.financialMetrics.transactions
      : [];
  }, [data]);

  const filteredTransactions = useMemo(() => {
    const q = paymentSearch.trim().toLowerCase();
    return allTransactions.filter((item: any) => {
      if (item.status !== paymentModalType) return false;
      if (!q) return true;
      const name = item.registration?.applicant?.fullName?.toLowerCase() || '';
      const regNum = item.registration?.applicant?.registrationNumber?.toLowerCase() || '';
      const prodiCode = item.registration?.studyProgram?.code?.toLowerCase() || '';
      const prodiName = item.registration?.studyProgram?.name?.toLowerCase() || '';
      return (
        name.includes(q) ||
        regNum.includes(q) ||
        prodiCode.includes(q) ||
        prodiName.includes(q)
      );
    });
  }, [allTransactions, paymentModalType, paymentSearch]);

  const modalTotalNominal = useMemo(() => {
    return filteredTransactions.reduce(
      (sum: number, item: any) => sum + (Number(item.amount) || 0),
      0,
    );
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-12">
      {/* Executive Welcome & Period Filter */}
      <div
        className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-colors ${isDark
          ? 'bg-[#0f172a] border-slate-800 shadow-2xl text-white'
          : 'bg-white border-slate-200/80 shadow-sm text-[#0f172a]'
          }`}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isDark
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'bg-[#0f172a] text-white'
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
            className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#0f172a]'
              }`}
          >
            Ikhtisar Eksekutif Penerimaan Mahasiswa Baru
          </h1>
          <p
            className={`text-xs mt-1 max-w-2xl leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
          >
            Pantau rekapitulasi uang muka pendaftaran, capaian kuota program studi penerbangan,
            integritas verifikasi panitia, dan pengaturan rekening resmi PMB.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Filter Gelombang */}
          <div
            className={`rounded-2xl px-3 py-2 flex items-center gap-1.5 flex-1 sm:flex-none min-w-0 border transition-colors ${isDark
              ? 'bg-slate-800/90 border-slate-700 text-white'
              : 'bg-[#0f172a] border-[#0f172a] text-white'
              }`}
          >
            <span
              className={`text-[11px] font-semibold whitespace-nowrap ${isDark ? 'text-sky-300' : 'text-slate-300'
                }`}
            >
              Gelombang:
            </span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer w-full sm:w-auto truncate"
            >
              <option
                value=""
                className="bg-[#0f172a] text-white"
              >
                Semua Gelombang
              </option>
              {periods.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                  className="bg-[#0f172a] text-white"
                >
                  T.A {p.year || p.academicYear || ''} - {p.name} {p.isActive ? '(Aktif)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={fetchStats}
            className={`p-2.5 rounded-xl transition-colors flex-shrink-0 border ${isDark
              ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-700 text-sky-400'
              : 'bg-[#0f172a] border-[#0f172a] hover:bg-slate-800 text-white'
              }`}
            title="Muat ulang data"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''
                }`}
            />
          </button>
        </div>
      </div>

      {/* Rekapitulasi Uang Muka (DP) Cards */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-1 mb-3">
          <h2
            className={`text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#0f172a]'
              }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>Rekapitulasi Uang Muka (DP) & Penerimaan PMB</span>
          </h2>
          <span
            className={`text-[10px] sm:text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
          >
            Klik kartu uang muka untuk melihat rincian
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: Uang Muka Masuk */}
          <button
            type="button"
            onClick={() => openPaymentModal('VERIFIED')}
            className={`text-left border p-4 sm:p-5 rounded-2xl relative overflow-hidden group transition-all flex flex-col justify-between cursor-pointer active:scale-[0.99] ${isDark
              ? 'bg-[#0f172a] border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/90'
              : 'bg-white border-slate-200/80 shadow-sm hover:border-emerald-500/60 hover:shadow-md'
              }`}
          >
            <div className="flex items-center justify-between w-full">
              <span
                className={`text-xs font-bold truncate ${isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
              >
                Uang Muka Masuk
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div
              className={`mt-3 text-lg sm:text-xl font-black truncate ${isDark ? 'text-emerald-400' : 'text-emerald-600'
                }`}
            >
              {formatRupiah(data?.financialMetrics?.verifiedAmount)}
            </div>
            <div className="mt-1.5 flex items-center justify-between w-full gap-2">
              <p
                className={`text-[11px] truncate ${isDark ? 'text-slate-500' : 'text-slate-500'
                  }`}
              >
                <span
                  className={`font-bold ${isDark ? 'text-slate-300' : 'text-[#0f172a]'
                    }`}
                >
                  {data?.financialMetrics?.verifiedCount || 0}
                </span>{' '}
                transaksi terverifikasi
              </p>
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold flex-shrink-0 transition-opacity ${isDark
                  ? 'text-emerald-400 opacity-90 sm:opacity-75 sm:group-hover:opacity-100'
                  : 'text-emerald-700 opacity-90 sm:opacity-75 sm:group-hover:opacity-100'
                  }`}
              >
                Rincian <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </button>

          {/* Card 2: Uang Muka Tertunda */}
          <button
            type="button"
            onClick={() => openPaymentModal('PENDING')}
            className={`text-left border p-4 sm:p-5 rounded-2xl relative overflow-hidden group transition-all flex flex-col justify-between cursor-pointer active:scale-[0.99] ${isDark
              ? 'bg-[#0f172a] border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/90'
              : 'bg-white border-slate-200/80 shadow-sm hover:border-amber-500/60 hover:shadow-md'
              }`}
          >
            <div className="flex items-center justify-between w-full">
              <span
                className={`text-xs font-bold truncate ${isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
              >
                Uang Muka Tertunda
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div
              className={`mt-3 text-lg sm:text-xl font-black truncate ${isDark ? 'text-amber-300' : 'text-amber-600'
                }`}
            >
              {formatRupiah(data?.financialMetrics?.pendingAmount)}
            </div>
            <div className="mt-1.5 flex items-center justify-between w-full gap-2">
              <p
                className={`text-[11px] truncate ${isDark ? 'text-slate-500' : 'text-slate-500'
                  }`}
              >
                <span
                  className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'
                    }`}
                >
                  {data?.financialMetrics?.pendingCount || 0}
                </span>{' '}
                menunggu verifikasi
              </p>
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold flex-shrink-0 transition-opacity ${isDark
                  ? 'text-amber-300 opacity-90 sm:opacity-75 sm:group-hover:opacity-100'
                  : 'text-amber-700 opacity-90 sm:opacity-75 sm:group-hover:opacity-100'
                  }`}
              >
                Rincian <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </button>

          {/* Card 3: Total Calon Mahasiswa */}
          <div
            className={`border p-4 sm:p-5 rounded-2xl relative overflow-hidden group transition-all flex flex-col justify-between ${isDark
              ? 'bg-[#0f172a] border-slate-800 hover:border-sky-500/40'
              : 'bg-white border-slate-200/80 shadow-sm hover:border-[#0f172a]/40'
              }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold truncate ${isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
              >
                Total Pendaftar
              </span>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark
                  ? 'bg-sky-500/10 text-sky-400'
                  : 'bg-[#0f172a]/10 text-[#0f172a]'
                  }`}
              >
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div
              className={`mt-3 text-lg sm:text-2xl font-black ${isDark ? 'text-sky-400' : 'text-[#0f172a]'
                }`}
            >
              {data?.applicantMetrics?.totalApplicants || 0}
            </div>
            <p
              className={`text-[11px] mt-1 truncate ${isDark ? 'text-slate-500' : 'text-slate-500'
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
            ? 'bg-[#0f172a] border-slate-800'
            : 'bg-white border-slate-200/80 shadow-sm'
            }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3
                className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#0f172a]'
                  }`}
              >
                <Building
                  className={`w-4 h-4 ${isDark ? 'text-sky-400' : 'text-[#0f172a]'
                    }`}
                />
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
              className={`text-[11px] font-bold flex items-center gap-1 transition-colors ${isDark
                ? 'text-sky-400 hover:text-sky-300'
                : 'text-[#0f172a] hover:text-sky-700'
                }`}
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
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        : 'bg-[#0f172a] text-white border-[#0f172a]'
                        }`}
                    >
                      {prog.code}
                    </span>
                    <span
                      className={`text-xs font-bold ${isDark ? 'text-slate-100' : 'text-[#0f172a]'
                        }`}
                    >
                      {prog.name}
                    </span>
                  </div>
                  <div className="text-left sm:text-right flex items-center sm:justify-end gap-1.5">
                    <span
                      className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-[#0f172a]'
                        }`}
                    >
                      {prog.acceptedCount} / {prog.quota} Siswa
                    </span>
                    <span
                      className={`text-[11px] font-bold ${isDark ? 'text-sky-400' : 'text-[#0f172a]'
                        }`}
                    >
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
                        : isDark
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600'
                          : 'bg-[#0f172a]'
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
                      ? 'bg-[#0f172a]/60 border-slate-800'
                      : 'bg-white border-slate-200/80 shadow-xs'
                      }`}
                  >
                    <span
                      className={`block text-[9px] sm:inline sm:text-[11px] ${isDark
                        ? 'text-slate-500 sm:text-slate-400'
                        : 'text-slate-500 sm:text-slate-600'
                        }`}
                    >
                      Peminat:{' '}
                    </span>
                    <span
                      className={`font-bold ${isDark ? 'text-slate-200' : 'text-[#0f172a]'
                        }`}
                    >
                      {prog.totalRegistered}
                    </span>
                  </div>
                  <div
                    className={`p-1.5 rounded-lg border sm:bg-transparent sm:p-0 sm:border-0 ${isDark
                      ? 'bg-[#0f172a]/60 border-slate-800'
                      : 'bg-white border-slate-200/80 shadow-xs'
                      }`}
                  >
                    <span
                      className={`block text-[9px] sm:inline sm:text-[11px] ${isDark
                        ? 'text-slate-500 sm:text-slate-400'
                        : 'text-slate-500 sm:text-slate-600'
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
                      ? 'bg-[#0f172a]/60 border-slate-800'
                      : 'bg-white border-slate-200/80 shadow-xs'
                      }`}
                  >
                    <span
                      className={`block text-[9px] sm:inline sm:text-[11px] ${isDark
                        ? 'text-slate-500 sm:text-slate-400'
                        : 'text-slate-500 sm:text-slate-600'
                        }`}
                    >
                      Sisa Kuota:{' '}
                    </span>
                    <span
                      className={`font-bold truncate ${isDark ? 'text-slate-200' : 'text-[#0f172a]'
                        }`}
                    >
                      {Math.max(0, (prog.quota || 0) - (prog.acceptedCount || 0))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Ekosistem Akun Pengguna */}
        <div
          className={`border rounded-2xl p-4 sm:p-6 flex flex-col justify-between transition-colors ${isDark
            ? 'bg-[#0f172a] border-slate-800'
            : 'bg-white border-slate-200/80 shadow-sm'
            }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#0f172a]'
                  }`}
              >
                <Users
                  className={`w-4 h-4 ${isDark ? 'text-sky-400' : 'text-[#0f172a]'
                    }`}
                />
                <span>Ekosistem Akun Pengguna</span>
              </h3>
              <Link
                href="/super-admin/users"
                className={`text-[11px] font-bold transition-colors ${isDark
                  ? 'text-sky-400 hover:text-sky-300'
                  : 'text-[#0f172a] hover:text-sky-700'
                  }`}
              >
                Kelola
              </Link>
            </div>

            <div className="space-y-3">
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${isDark
                  ? 'bg-slate-800/80 border-slate-700 text-sky-300'
                  : 'bg-slate-100 border-slate-300 text-[#0f172a]'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <Crown
                    className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-[#0f172a]'
                      }`}
                  />
                  <div>
                    <div className="text-xs font-bold">Super Administrator</div>
                    <div
                      className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'
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
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${isDark
                ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
                : 'bg-[#0f172a] hover:bg-slate-800 text-white shadow-slate-900/20'
                }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah / Kelola Akun Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Registration Funnel & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Funnel (Status Pendaftar) */}
        <div
          className={`border rounded-2xl p-4 sm:p-6 transition-colors ${isDark
            ? 'bg-[#0f172a] border-slate-800'
            : 'bg-white border-slate-200/80 shadow-sm'
            }`}
        >
          <h3
            className={`text-sm font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#0f172a]'
              }`}
          >
            <TrendingUp
              className={`w-4 h-4 ${isDark ? 'text-sky-400' : 'text-[#0f172a]'
                }`}
            />
            <span>Status Corong Seleksi PMB</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div
              className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${isDark
                ? 'bg-slate-800/40 border-slate-800 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
            >
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                Belum Lengkap
              </span>
              <span className="font-bold">
                {data?.applicantMetrics?.belumLengkap || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
              <span>Menunggu Verifikasi</span>
              <span className="font-black">
                {data?.applicantMetrics?.menungguVerifikasi || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
              <span>Berkas Diverifikasi</span>
              <span className="font-black">
                {data?.applicantMetrics?.diverifikasi || 0}
              </span>
            </div>
            <div
              className={`flex items-center justify-between p-2 rounded-lg border ${isDark
                ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                : 'bg-[#0f172a]/10 text-[#0f172a] border-[#0f172a]/20'
                }`}
            >
              <span>Lulus Seleksi</span>
              <span className="font-black">
                {data?.applicantMetrics?.lulusSeleksi || 0}
              </span>
            </div>
            <div
              className={`flex items-center justify-between p-2 rounded-lg border ${isDark
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                : 'bg-slate-200/70 text-[#0f172a] border-slate-300'
                }`}
            >
              <span>Daftar Ulang</span>
              <span className="font-black">
                {data?.applicantMetrics?.daftarUlang || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <span>Diterima Resmi</span>
              <span className="font-black">
                {data?.applicantMetrics?.diterima || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
              <span>Tidak Lolos / Ditolak</span>
              <span className="font-black">
                {data?.applicantMetrics?.ditolak || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Audit Trail Preview (2 Cols) */}
        <div
          className={`lg:col-span-2 border rounded-2xl p-4 sm:p-6 transition-colors ${isDark
            ? 'bg-[#0f172a] border-slate-800'
            : 'bg-white border-slate-200/80 shadow-sm'
            }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#0f172a]'
                  }`}
              >
                <Activity
                  className={`w-4 h-4 ${isDark ? 'text-sky-400' : 'text-[#0f172a]'
                    }`}
                />
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
              className={`text-[11px] font-bold flex items-center gap-1 transition-colors ${isDark
                ? 'text-sky-400 hover:text-sky-300'
                : 'text-[#0f172a] hover:text-sky-700'
                }`}
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
                    : 'bg-slate-50/70 border-slate-200 text-[#0f172a]'
                    }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${isDark
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'bg-[#0f172a] text-white'
                          }`}
                      >
                        {log.action}
                      </span>
                      <span
                        className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-[#0f172a]'
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
                        className={`font-medium ${isDark ? 'text-slate-300' : 'text-[#0f172a]'
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

      {/* Pop-up Rincian Uang Muka (Fleksibel Mobile & Desktop) */}
      {paymentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-[2px] p-0 sm:p-4"
          onClick={() => setPaymentModalOpen(false)}
        >
          <div
            className={`w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[84vh] transition-colors ${isDark
              ? 'bg-[#0f172a] border-slate-800 text-white'
              : 'bg-white border-slate-200 text-[#0f172a]'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle khusus Mobile */}
            <div className="sm:hidden flex justify-center pt-2.5 pb-1">
              <div
                className={`w-10 h-1 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'
                  }`}
              />
            </div>

            {/* Modal Header */}
            <div
              className={`px-4 sm:px-6 pt-3 pb-4 sm:py-5 border-b flex items-start justify-between gap-3 ${isDark ? 'border-slate-800' : 'border-slate-200/80'
                }`}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${paymentModalType === 'VERIFIED'
                      ? isDark
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isDark
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                  >
                    {paymentModalType === 'VERIFIED' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Lunas</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        <span>Tertunda</span>
                      </>
                    )}
                  </span>

                  <span
                    className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                  >
                    {selectedPeriod
                      ? 'Sesuai gelombang terpilih'
                      : 'Semua Gelombang'}
                  </span>
                </div>

                <h3
                  className={`text-base sm:text-lg font-black tracking-tight leading-snug ${isDark ? 'text-white' : 'text-[#0f172a]'
                    }`}
                >
                  {paymentModalType === 'VERIFIED'
                    ? 'Uang Muka Masuk (Lunas)'
                    : 'Uang Muka Tertunda'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className={`p-2 rounded-xl border transition-colors flex-shrink-0 cursor-pointer ${isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-[#0f172a] hover:bg-slate-200'
                  }`}
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar */}
            <div
              className={`px-4 sm:px-6 py-3 border-b ${isDark
                ? 'bg-slate-900/50 border-slate-800'
                : 'bg-slate-50/70 border-slate-200/80'
                }`}
            >
              <div className="relative w-full">
                <Search
                  className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                />
                <input
                  type="text"
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  placeholder="Cari nama pendaftar, no. pendaftaran, atau prodi..."
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none transition-colors ${isDark
                    ? 'bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-sky-500/50'
                    : 'bg-white border-slate-200 text-[#0f172a] placeholder:text-slate-400 focus:border-[#0f172a]'
                    }`}
                />
              </div>
            </div>

            {/* List Transaksi */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {filteredTransactions.length === 0 ? (
                <div
                  className={`py-10 px-4 text-center rounded-2xl border border-dashed ${isDark
                    ? 'border-slate-800 bg-slate-900/30'
                    : 'border-slate-200 bg-slate-50/50'
                    }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center ${isDark
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-slate-100 text-slate-500'
                      }`}
                  >
                    <Receipt className="w-5 h-5" />
                  </div>
                  <p
                    className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-[#0f172a]'
                      }`}
                  >
                    {paymentModalType === 'VERIFIED'
                      ? 'Belum ada uang muka lunas'
                      : 'Tidak ada uang muka tertunda'}
                  </p>
                  <p
                    className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'
                      }`}
                  >
                    {paymentSearch
                      ? 'Tidak ada data yang cocok dengan kata kunci pencarian.'
                      : 'Data transaksi akan tampil otomatis saat tersedia.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredTransactions.map((trx: any) => {
                    const applicant = trx.registration?.applicant;
                    const prodi = trx.registration?.studyProgram;
                    const period = trx.registration?.period;
                    const tanggal = new Date(
                      trx.verifiedAt || trx.createdAt,
                    ).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    });

                    return (
                      <div
                        key={trx.id}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 ${isDark
                          ? 'bg-slate-800/40 border-slate-800'
                          : 'bg-slate-50/70 border-slate-200/80'
                          }`}
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`text-xs sm:text-sm font-bold break-words ${isDark ? 'text-white' : 'text-[#0f172a]'
                                }`}
                            >
                              {applicant?.fullName || 'Pendaftar'}
                            </span>
                            {prodi?.code && (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isDark
                                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                                  : 'bg-[#0f172a] text-white border-[#0f172a]'
                                  }`}
                              >
                                {prodi.code}
                              </span>
                            )}
                            {applicant?.registrationNumber && (
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${isDark
                                  ? 'bg-slate-900 border-slate-700 text-slate-400'
                                  : 'bg-white border-slate-200 text-slate-600'
                                  }`}
                              >
                                {applicant.registrationNumber.slice(0, 8).toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div
                            className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'
                              }`}
                          >
                            <span>{trx.paymentType || 'Biaya Pendaftaran'}</span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {tanggal}
                            </span>
                            {period?.name && (
                              <>
                                <span>•</span>
                                <span>
                                  T.A {period.year} - {period.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/70 dark:border-slate-800 flex-shrink-0 gap-1">
                          <span
                            className={`text-sm sm:text-base font-black ${paymentModalType === 'VERIFIED'
                              ? isDark
                                ? 'text-emerald-400'
                                : 'text-emerald-600'
                              : isDark
                                ? 'text-amber-300'
                                : 'text-amber-600'
                              }`}
                          >
                            {formatRupiah(trx.amount)}
                          </span>

                          {paymentModalType === 'VERIFIED' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              Lunas
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                              <Clock className="w-3 h-3" />
                              Tertunda
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className={`px-4 sm:px-6 py-3.5 border-t flex items-center justify-between gap-2 ${isDark
                ? 'bg-slate-900/80 border-slate-800'
                : 'bg-slate-50 border-slate-200/80'
                }`}
            >
              <span
                className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
              >
                <strong className={isDark ? 'text-white' : 'text-[#0f172a]'}>
                  {filteredTransactions.length}
                </strong>{' '}
                transaksi
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                >
                  Total:
                </span>
                <span
                  className={`text-sm sm:text-base font-black ${paymentModalType === 'VERIFIED'
                    ? isDark
                      ? 'text-emerald-400'
                      : 'text-emerald-600'
                    : isDark
                      ? 'text-amber-300'
                      : 'text-amber-600'
                    }`}
                >
                  {formatRupiah(modalTotalNominal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}