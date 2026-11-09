'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useSuperAdminTheme } from '@/context/SuperAdminThemeContext';
import {
  Activity,
  Search,
  RefreshCw,
  Filter,
  CheckCircle2,
  Clock,
  ShieldAlert,
  User,
  KeyRound,
  FileCheck,
  CreditCard,
  Trash2,
  Settings,
  Calendar,
} from 'lucide-react';

export default function SuperAdminAuditLogsPage() {
  const { isDark } = useSuperAdminTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const param = actionFilter ? `?action=${actionFilter}` : '';
      const res = await api.get(`/super-admin/audit-logs${param}`);
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(q) ||
      log.target?.toLowerCase().includes(q) ||
      log.details?.toLowerCase().includes(q) ||
      log.userEmail?.toLowerCase().includes(q)
    );
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'VERIFY_PAYMENT':
        return {
          label: 'Verifikasi Pembayaran',
          icon: CreditCard,
          className: isDark
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'VERIFY_DOCUMENT':
        return {
          label: 'Verifikasi Berkas',
          icon: FileCheck,
          className: isDark
            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
            : 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'STATUS_UPDATE':
        return {
          label: 'Update Status Seleksi',
          icon: Activity,
          className: isDark
            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
            : 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'CREATE_ADMIN_USER':
        return {
          label: 'Buat Akun Admin',
          icon: User,
          className: isDark
            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
            : 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'UPDATE_USER_ROLE':
        return {
          label: 'Ubah Role Akses',
          icon: ShieldAlert,
          className: isDark
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            : 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'RESET_USER_PASSWORD':
        return {
          label: 'Reset Password',
          icon: KeyRound,
          className: isDark
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            : 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'TRASH_APPLICANT':
        return {
          label: 'Pindah ke Tong Sampah',
          icon: Trash2,
          className: isDark
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            : 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'RESTORE_APPLICANT':
        return {
          label: 'Pulihkan dari Sampah',
          icon: RefreshCw,
          className: isDark
            ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
            : 'bg-sky-50 text-sky-700 border-sky-200',
        };
      case 'PERMANENT_DELETE_APPLICANT':
      case 'PURGE_TRASH':
      case 'DELETE_USER':
        return {
          label: 'Hapus Permanen',
          icon: Trash2,
          className: isDark
            ? 'bg-rose-600/30 text-rose-200 border-rose-600/40'
            : 'bg-rose-100 text-rose-800 border-rose-300',
        };
      case 'UPDATE_SYSTEM_SETTINGS':
        return {
          label: 'Pengaturan Sistem',
          icon: Settings,
          className: isDark
            ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
            : 'bg-teal-50 text-teal-700 border-teal-200',
        };
      default:
        return {
          label: action,
          icon: Activity,
          className: isDark
            ? 'bg-slate-700/50 text-slate-300 border-slate-600'
            : 'bg-slate-200 text-slate-700 border-slate-300',
        };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl border shadow-xl transition-colors ${isDark
          ? 'bg-slate-900 border-slate-800 text-white'
          : 'bg-white border-slate-200/80 text-slate-900 shadow-sm'
          }`}
      >
        <div>
          <h1
            className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-slate-900'
              }`}
          >

            <span>Audit Log & Integritas Aktivitas Sistem</span>
          </h1>
          <p
            className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
          >
            Rekam jejak setiap aksi krusial: verifikasi berkas, validasi pembayaran pendaftaran,
            perubahan kelulusan, dan pengelolaan akun.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className={`w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${isDark
            ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white'
            : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-500' : ''}`} />
          <span>Segarkan Log</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`border p-3 sm:p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 transition-colors ${isDark
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-200/80 shadow-sm'
          }`}
      >
        {/* Filter Action Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className={`px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 cursor-pointer w-full md:w-auto transition-colors ${isDark
              ? 'bg-slate-950 border-slate-800 text-white'
              : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
          >
            <option value="">Semua Jenis Tindakan</option>
            <option value="VERIFY_PAYMENT">Verifikasi Pembayaran</option>
            <option value="VERIFY_DOCUMENT">Verifikasi Berkas Dokumen</option>
            <option value="STATUS_UPDATE">Update Status Pendaftaran</option>
            <option value="CREATE_ADMIN_USER">Pembuatan Akun Admin</option>
            <option value="UPDATE_USER_ROLE">Perubahan Role Pengguna</option>
            <option value="RESET_USER_PASSWORD">Reset Kata Sandi</option>
            <option value="TRASH_APPLICANT">Penghapusan ke Tong Sampah</option>
            <option value="RESTORE_APPLICANT">Pemulihan Pendaftar</option>
            <option value="PERMANENT_DELETE_APPLICANT">Hapus Permanen Pendaftar</option>
            <option value="UPDATE_SYSTEM_SETTINGS">Pengaturan Global Sistem</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search
            className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
          />
          <input
            type="text"
            placeholder="Cari pelaksana, target, atau rincian..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 border rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors ${isDark
              ? 'bg-slate-950 border-slate-800 text-white'
              : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
          />
        </div>
      </div>

      {/* Logs Table / List */}
      <div
        className={`border rounded-2xl overflow-hidden shadow-xl transition-colors ${isDark
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-200/80 shadow-sm'
          }`}
      >
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className={`font-bold uppercase tracking-wider text-[10px] border-b transition-colors ${isDark
                ? 'bg-slate-950/80 text-slate-400 border-slate-800'
                : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
            >
              <tr>
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4">Jenis Tindakan</th>
                <th className="py-3.5 px-4">Pelaksana (Admin)</th>
                <th className="py-3.5 px-4">Target / Entitas</th>
                <th className="py-3.5 px-4">Rincian Perubahan</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y transition-colors ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'
                }`}
            >
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat riwayat audit...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Tidak ada catatan aktivitas audit yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const Icon = badge.icon;
                  return (
                    <tr
                      key={log.id}
                      className={`transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'
                        }`}
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div
                          className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'
                            }`}
                        >
                          {new Date(log.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </div>
                        <div
                          className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'
                            }`}
                        >
                          {new Date(log.createdAt).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      {/* Action Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.className}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Actor */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div
                          className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'
                            }`}
                        >
                          {log.userEmail || 'Sistem Otomatis'}
                        </div>
                        <div
                          className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}
                        >
                          Role:{' '}
                          <span className="font-semibold">{log.user?.role || 'SYSTEM'}</span>
                        </div>
                      </td>

                      {/* Target */}
                      <td
                        className={`py-3 px-4 font-semibold max-w-xs truncate ${isDark ? 'text-slate-200' : 'text-slate-800'
                          }`}
                      >
                        {log.target || '-'}
                      </td>

                      {/* Details */}
                      <td
                        className={`py-3 px-4 max-w-md ${isDark ? 'text-slate-300' : 'text-slate-600'
                          }`}
                      >
                        <p className="line-clamp-2 leading-relaxed text-[11px]">
                          {log.details || '-'}
                        </p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div
          className={`md:hidden divide-y transition-colors ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'
            }`}
        >
          {loading ? (
            <div className="py-12 text-center text-slate-500">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Memuat riwayat audit...</span>
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Tidak ada catatan aktivitas audit yang sesuai.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const badge = getActionBadge(log.action);
              const Icon = badge.icon;
              return (
                <div key={log.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.className}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                    <span
                      className={`text-[10px] text-right flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                    >
                      {new Date(log.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      ,{' '}
                      {new Date(log.createdAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  {log.target && (
                    <div
                      className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'
                        }`}
                    >
                      Target:{' '}
                      <span
                        className={
                          isDark ? 'text-purple-300' : 'text-purple-700 font-bold'
                        }
                      >
                        {log.target}
                      </span>
                    </div>
                  )}

                  {log.details && (
                    <p
                      className={`text-[11px] p-2.5 rounded-xl border leading-relaxed transition-colors ${isDark
                        ? 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                    >
                      {log.details}
                    </p>
                  )}

                  <div
                    className={`text-[10px] flex items-center justify-between pt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                  >
                    <span>
                      Oleh:{' '}
                      <strong
                        className={isDark ? 'text-slate-200' : 'text-slate-800'}
                      >
                        {log.userEmail || 'Sistem'}
                      </strong>
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-semibold ${isDark
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-slate-200 text-slate-700'
                        }`}
                    >
                      {log.user?.role || 'SYSTEM'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}