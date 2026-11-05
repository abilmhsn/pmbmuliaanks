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

export default function SuperAdminDashboardPage() {
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
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Executive Welcome & Period Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 p-6 rounded-3xl border border-purple-500/20 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Executive PMB Console
            </span>
            <span className="text-xs text-slate-400">Kampus Mulia Angkasa</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Ikhtisar Eksekutif Penerimaan Mahasiswa Baru
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Pantau rekapitulasi finansial pendaftaran, capaian kuota program studi penerbangan,
            integritas verifikasi panitia, dan kontrol kebijakan global sistem PMB.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Gelombang */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3 py-1.5 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Gelombang:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-white">Semua Gelombang</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.name} {p.isActive ? '(Aktif)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={fetchStats}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Muat ulang data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Global Status Banner & Emergency Switch */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-lg ${
              data?.isRegistrationOpen
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-rose-500/10'
            }`}
          >
            {data?.isRegistrationOpen ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Status Portal PMB Publik:
              </span>
              <span
                className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${
                  data?.isRegistrationOpen
                    ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20'
                    : 'bg-rose-400/10 text-rose-300 border border-rose-400/20'
                }`}
              >
                {data?.isRegistrationOpen ? 'Terbuka Untuk Umum' : 'Ditutup Sementara'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {data?.isRegistrationOpen
                ? 'Calon mahasiswa dapat melakukan registrasi akun baru dan memilih program studi.'
                : 'Pendaftaran akun baru dinonaktifkan sementara. Calon mahasiswa yang sudah memiliki akun tetap dapat login.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleRegistration}
          disabled={togglingReg || loading}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 whitespace-nowrap ${
            data?.isRegistrationOpen
              ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{data?.isRegistrationOpen ? 'Tutup Pendaftaran' : 'Buka Pendaftaran'}</span>
        </button>
      </div>

      {/* Financial Metrics Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Rekapitulasi Finansial & Penerimaan PMB</span>
          </h2>
          <span className="text-[11px] text-slate-500">Otomatis dari verifikasi pembayaran</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Uang Formulir Masuk */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Kas Masuk (Formulir)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-xl font-black text-emerald-400">
              {formatRupiah(data?.financialMetrics?.verifiedAmount)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Dari <span className="font-bold text-slate-300">{data?.financialMetrics?.verifiedCount || 0}</span> pembayaran diverifikasi
            </p>
          </div>

          {/* Card 2: Uang Formulir Tertunda */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Tertunda (Menunggu)</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-xl font-black text-amber-300">
              {formatRupiah(data?.financialMetrics?.pendingAmount)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              <span className="font-bold text-amber-300">{data?.financialMetrics?.pendingCount || 0}</span> bukti transfer belum divalidasi
            </p>
          </div>

          {/* Card 3: Potensi SPP Mahasiswa Diterima */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Potensi SPP Kuliah</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-xl font-black text-purple-300">
              {formatRupiah(data?.financialMetrics?.totalPotentialTuition)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Estimasi mahasiswa diterima & daftar ulang
            </p>
          </div>

          {/* Card 4: Total Calon Mahasiswa */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-sky-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Total Pendaftar PMB</span>
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-black text-sky-400">
              {data?.applicantMetrics?.totalApplicants || 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Calon mahasiswa aktif di database
            </p>
          </div>
        </div>
      </div>

      {/* Program Studi Quota Fulfillment & User Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Kuota Prodi Penerbangan */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-400" />
                <span>Keterisian Kuota Program Studi Penerbangan</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Target kapasitas per program keahlian Kampus Mulia Angkasa
              </p>
            </div>
            <Link
              href="/admin/master-data"
              className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>Ubah Kuota</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-5">
            {data?.programFulfillment?.map((prog: any) => (
              <div
                key={prog.id}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mr-2">
                      {prog.code}
                    </span>
                    <span className="text-xs font-bold text-slate-100">{prog.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-white">
                      {prog.acceptedCount} / {prog.quota} Siswa
                    </span>
                    <span className="text-[11px] text-purple-400 font-bold ml-2">
                      ({prog.percentageFilled}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      prog.percentageFilled >= 90
                        ? 'bg-rose-500'
                        : prog.percentageFilled >= 50
                        ? 'bg-amber-400'
                        : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, prog.percentageFilled)}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800/60">
                  <div>
                    Total Peminat Mendaftar: <span className="font-bold text-slate-200">{prog.totalRegistered}</span>
                  </div>
                  <div>
                    Lulus Seleksi: <span className="font-bold text-emerald-400">{prog.passedCount}</span>
                  </div>
                  <div>
                    SPP: <span className="font-bold text-slate-200">{formatRupiah(prog.tuitionFee)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Ekosistem Pengguna Sistem */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Ekosistem Akun Pengguna</span>
              </h3>
              <Link
                href="/super-admin/users"
                className="text-[11px] font-bold text-purple-400 hover:text-purple-300"
              >
                Kelola
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Crown className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-xs font-bold text-purple-200">Super Administrator</div>
                    <div className="text-[10px] text-purple-300/70">Pimpinan & Administrator Sistem</div>
                  </div>
                </div>
                <span className="text-lg font-black text-purple-300">
                  {data?.userDemographic?.superAdminCount || 0}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-amber-200">Admin Panitia PMB</div>
                    <div className="text-[10px] text-amber-300/70">Verifikator berkas & pembayaran</div>
                  </div>
                </div>
                <span className="text-lg font-black text-amber-300">
                  {data?.userDemographic?.adminCount || 0}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="text-xs font-bold text-sky-200">Akun Mahasiswa / Pelamar</div>
                    <div className="text-[10px] text-sky-300/70">Pengguna portal pendaftaran</div>
                  </div>
                </div>
                <span className="text-lg font-black text-sky-300">
                  {data?.userDemographic?.applicantCount || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4">
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
        {/* Registration Funnel (Status Pendaftar) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>Status Corong Seleksi PMB</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
              <span className="text-slate-400">Belum Lengkap</span>
              <span className="font-bold text-slate-300">{data?.applicantMetrics?.belumLengkap || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <span>Menunggu Verifikasi</span>
              <span className="font-black">{data?.applicantMetrics?.menungguVerifikasi || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20">
              <span>Berkas Diverifikasi</span>
              <span className="font-black">{data?.applicantMetrics?.diverifikasi || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <span>Lulus Seleksi</span>
              <span className="font-black">{data?.applicantMetrics?.lulusSeleksi || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
              <span>Daftar Ulang</span>
              <span className="font-black">{data?.applicantMetrics?.daftarUlang || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <span>Diterima Resmi</span>
              <span className="font-black">{data?.applicantMetrics?.diterima || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20">
              <span>Tidak Lolos / Ditolak</span>
              <span className="font-black">{data?.applicantMetrics?.ditolak || 0}</span>
            </div>
          </div>
        </div>

        {/* Audit Trail Preview (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>Log Aktivitas & Audit Panitia Terbaru</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Integritas tindakan: memantau verifikasi berkas, pembayaran, dan perubahan status
              </p>
            </div>
            <Link
              href="/super-admin/audit-logs"
              className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>Semua Log</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {data?.recentAuditLogs?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Belum ada aktivitas tercatat pada sistem.
              </div>
            ) : (
              data?.recentAuditLogs?.map((log: any) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 uppercase">
                        {log.action}
                      </span>
                      <span className="text-slate-300 font-semibold truncate">
                        {log.target || 'Sistem'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] line-clamp-1">{log.details}</p>
                    <p className="text-slate-500 text-[10px] mt-1">
                      Oleh: <span className="text-slate-300 font-medium">{log.userEmail || 'Sistem'}</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 flex-shrink-0">
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
