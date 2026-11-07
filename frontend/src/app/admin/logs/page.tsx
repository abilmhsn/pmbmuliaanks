'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { History, Search, RefreshCw, ShieldCheck, User } from 'lucide-react';

export default function AdminAuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/audit-logs');
            setLogs(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Gagal mengambil audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // Filter pencarian berdasarkan nama/email admin, aksi, atau target
    const filteredLogs = logs.filter((log) => {
        const term = search.toLowerCase();
        return (
            (log.userEmail && log.userEmail.toLowerCase().includes(term)) ||
            (log.action && log.action.toLowerCase().includes(term)) ||
            (log.target && log.target.toLowerCase().includes(term)) ||
            (log.details && log.details.toLowerCase().includes(term))
        );
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-0">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20">
                            Sistem Keamanan & Transparansi PMB
                        </span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                        <History className="w-6 h-6 text-sky-400" /> Log Kerja & Aktivitas Admin
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Rekam jejak digital seluruh tindakan verifikasi, perubahan status, dan pengelolaan data oleh panitia admin.
                    </p>
                </div>

                <button
                    onClick={fetchLogs}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Log
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div className="relative max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                        type="text"
                        placeholder="Cari email admin, jenis aksi, atau nama pendaftar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                </div>
            </div>

            {/* Audit Log Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300 min-w-[800px]">
                        <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="p-4">Waktu (Timestamp)</th>
                                <th className="p-4">Admin / Operator</th>
                                <th className="p-4">Jenis Aksi (Action)</th>
                                <th className="p-4">Target Data</th>
                                <th className="p-4">Rincian Perubahan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        Memuat catatan aktivitas kerja admin...
                                    </td>
                                </tr>
                            ) : filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                                        {/* Timestamp */}
                                        <td className="p-4 font-mono text-slate-400 whitespace-nowrap">
                                            {new Date(log.createdAt).toLocaleString('id-ID', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                            })}
                                        </td>

                                        {/* Admin / Operator */}
                                        <td className="p-4 font-bold text-white whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-sky-400" />
                                                <span>{log.userEmail || 'Admin System'}</span>
                                            </div>
                                        </td>

                                        {/* Action Badge */}
                                        <td className="p-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase whitespace-nowrap border ${log.action?.includes('VERIFY')
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                    : log.action?.includes('STATUS')
                                                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                                                        : log.action?.includes('TRASH') || log.action?.includes('DELETE')
                                                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                                    }`}
                                            >
                                                {log.action}
                                            </span>
                                        </td>

                                        {/* Target Data */}
                                        <td className="p-4 font-semibold text-amber-400 whitespace-nowrap">
                                            {log.target || '-'}
                                        </td>

                                        {/* Details */}
                                        <td className="p-4 text-slate-300 max-w-xs truncate" title={log.details}>
                                            {log.details || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        Belum ada riwayat aktivitas log kerja yang dicatat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}