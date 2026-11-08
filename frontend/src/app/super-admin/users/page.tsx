'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Crown,
  KeyRound,
  Trash2,
  Search,
  RefreshCw,
  X,
  Check,
  User,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function SuperAdminUsersPage() {
  const { user: currentLoggedUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'SUPER_ADMIN' | 'ADMIN' | 'APPLICANT'>('ALL');

  // Modal Create Admin
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    role: 'ADMIN' as 'ADMIN' | 'SUPER_ADMIN',
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Modal Change Role
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [targetUserRole, setTargetUserRole] = useState<any | null>(null);
  const [newRoleSelect, setNewRoleSelect] = useState<'SUPER_ADMIN' | 'ADMIN' | 'APPLICANT'>('ADMIN');
  const [roleSubmitting, setRoleSubmitting] = useState(false);

  // Modal Reset Password
  const [showResetModal, setShowResetModal] = useState(false);
  const [targetUserPass, setTargetUserPass] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const roleParam = selectedRole !== 'ALL' ? `?role=${selectedRole}` : '';
      const res = await api.get(`/super-admin/users${roleParam}`);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered by search client-side or server
  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const emailMatch = u.email?.toLowerCase().includes(q);
    const nameMatch = u.applicant?.fullName?.toLowerCase().includes(q);
    const phoneMatch = u.applicant?.phone?.toLowerCase().includes(q);
    const regMatch = u.applicant?.registrationNumber?.toLowerCase().includes(q);
    return emailMatch || nameMatch || phoneMatch || regMatch;
  });

  // Handler Create Admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.email || !createForm.password) {
      alert('Email dan password wajib diisi');
      return;
    }

    try {
      setCreateSubmitting(true);
      await api.post('/super-admin/users/admin', createForm);
      alert(`Akun ${createForm.role} baru berhasil dibuat!`);
      setShowCreateModal(false);
      setCreateForm({ email: '', password: '', role: 'ADMIN' });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membuat akun');
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Handler Change Role
  const handleChangeRole = async () => {
    if (!targetUserRole) return;
    try {
      setRoleSubmitting(true);
      await api.put(`/super-admin/users/${targetUserRole.id}/role`, {
        role: newRoleSelect,
      });
      alert(`Role ${targetUserRole.email} berhasil diubah ke ${newRoleSelect}!`);
      setShowRoleModal(false);
      setTargetUserRole(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah role');
    } finally {
      setRoleSubmitting(false);
    }
  };

  // Handler Reset Password
  const handleResetPassword = async () => {
    if (!targetUserPass || !newPasswordInput) return;
    if (newPasswordInput.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }

    try {
      setResetSubmitting(true);
      await api.put(`/super-admin/users/${targetUserPass.id}/reset-password`, {
        password: newPasswordInput,
      });
      alert(`Password untuk ${targetUserPass.email} berhasil di-reset!`);
      setShowResetModal(false);
      setTargetUserPass(null);
      setNewPasswordInput('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mereset password');
    } finally {
      setResetSubmitting(false);
    }
  };

  // Handler Delete User
  const handleDeleteUser = async (u: any) => {
    if (u.id === currentLoggedUser?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }

    const confirmMsg = `YAKIN HAPUS PERMANEN akun "${u.email}"?\n\nPerhatian: Jika user ini mahasiswa, data pendaftaran dan berkasnya juga akan terhapus.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.delete(`/super-admin/users/${u.id}`);
      alert(`Pengguna ${u.email} berhasil dihapus.`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus pengguna');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex p-4 rounded-2xl bg-slate-900 flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">

            <span>Manajemen Tim & Hak Akses Pengguna</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelola akun panitia PMB, angkat administrator baru, setel ulang kata sandi, dan atur peran pengguna.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 active:scale-95 transition-all whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Admin Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        {/* Role Tabs */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 w-full md:w-auto">
          {[
            { id: 'ALL', label: 'Semua Akun' },
            { id: 'SUPER_ADMIN', label: 'Super Admin' },
            { id: 'ADMIN', label: 'Admin Panitia' },
            { id: 'APPLICANT', label: 'Mahasiswa' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRole(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${selectedRole === tab.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input & Refresh */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari email, nama, no HP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            onClick={fetchUsers}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors flex-shrink-0"
            title="Muat ulang"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Pengguna & Identitas</th>
                <th className="py-3.5 px-4">Role Akses</th>
                <th className="py-3.5 px-4">Keterangan / Prodi</th>
                <th className="py-3.5 px-4">Tgl Registrasi</th>
                <th className="py-3.5 px-4 text-right">Tindakan Super Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat data pengguna...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Tidak ditemukan pengguna yang cocok dengan kriteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = u.id === currentLoggedUser?.id;
                  const reg = u.applicant?.registrations?.[0];
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Email & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${u.role === 'SUPER_ADMIN'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : u.role === 'ADMIN'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              }`}
                          >
                            {u.role === 'SUPER_ADMIN' ? (
                              <Crown className="w-4 h-4" />
                            ) : u.role === 'ADMIN' ? (
                              <ShieldCheck className="w-4 h-4" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{u.email}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {u.applicant?.fullName || 'Staff / Internal Kampus'}
                              {u.applicant?.phone ? ` • ${u.applicant.phone}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${u.role === 'SUPER_ADMIN'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : u.role === 'ADMIN'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                            }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Description / Program */}
                      <td className="py-3 px-4 text-slate-400">
                        {reg?.studyProgram ? (
                          <div>
                            <span className="font-bold text-slate-200">
                              {reg.studyProgram.code}
                            </span>{' '}
                            - {reg.studyProgram.name}
                            <span className="block text-[10px] text-slate-500">
                              Status: <strong className="text-slate-300">{reg.status}</strong>
                            </span>
                          </div>
                        ) : u.applicant ? (
                          <span className="text-amber-400/80">Belum pilih prodi</span>
                        ) : (
                          <span className="text-slate-500">Akses Pengelola Sistem</span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Ubah Role */}
                          <button
                            onClick={() => {
                              setTargetUserRole(u);
                              setNewRoleSelect(u.role);
                              setShowRoleModal(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] font-semibold flex items-center gap-1"
                            title="Ubah Role"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                            <span className="hidden sm:inline">Role</span>
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              setTargetUserPass(u);
                              setNewPasswordInput('');
                              setShowResetModal(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] font-semibold flex items-center gap-1"
                            title="Reset Password Pengguna"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                            <span className="hidden sm:inline">Reset</span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors ${isCurrent ? 'opacity-30 cursor-not-allowed' : ''
                              }`}
                            title={isCurrent ? 'Tidak dapat menghapus diri sendiri' : 'Hapus Akun'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (sm and down) */}
        <div className="md:hidden divide-y divide-slate-800/60">
          {loading ? (
            <div className="py-12 text-center text-slate-500">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Memuat data pengguna...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Tidak ditemukan pengguna yang cocok dengan kriteria.
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isCurrent = u.id === currentLoggedUser?.id;
              const reg = u.applicant?.registrations?.[0];
              return (
                <div key={u.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${u.role === 'SUPER_ADMIN'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : u.role === 'ADMIN'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          }`}
                      >
                        {u.role === 'SUPER_ADMIN' ? (
                          <Crown className="w-4 h-4" />
                        ) : u.role === 'ADMIN' ? (
                          <ShieldCheck className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span className="truncate">{u.email}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex-shrink-0">
                              Anda
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {u.applicant?.fullName || 'Staff / Internal Kampus'}
                          {u.applicant?.phone ? ` • ${u.applicant.phone}` : ''}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase flex-shrink-0 ${u.role === 'SUPER_ADMIN'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : u.role === 'ADMIN'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        }`}
                    >
                      {u.role}
                    </span>
                  </div>

                  {/* Program info or note */}
                  <div className="text-[11px] bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-slate-300">
                    {reg?.studyProgram ? (
                      <div>
                        <span className="font-bold text-white">{reg.studyProgram.code}</span> - {reg.studyProgram.name}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Status: <strong className="text-slate-200">{reg.status}</strong>
                        </div>
                      </div>
                    ) : u.applicant ? (
                      <span className="text-amber-400/90 font-medium">Belum memilih program studi</span>
                    ) : (
                      <span className="text-slate-400">Akses Pengelola Sistem Kampus</span>
                    )}
                    <div className="text-[10px] text-slate-500 mt-1">
                      Terdaftar: {new Date(u.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Mobile Actions Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => {
                        setTargetUserRole(u);
                        setNewRoleSelect(u.role);
                        setShowRoleModal(true);
                      }}
                      className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700/50"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      <span>Role</span>
                    </button>

                    <button
                      onClick={() => {
                        setTargetUserPass(u);
                        setNewPasswordInput('');
                        setShowResetModal(true);
                      }}
                      className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700/50"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reset</span>
                    </button>

                    <button
                      onClick={() => handleDeleteUser(u)}
                      disabled={isCurrent}
                      className={`py-2 px-2 rounded-xl text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-rose-500/20 ${isCurrent ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL: Tambah Admin Baru */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Tambah Akun Pengelola Baru</h3>
                <p className="text-xs text-slate-400">Buat akun untuk Panitia PMB atau Super Admin</p>
              </div>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alamat Email Resmi
                </label>
                <input
                  type="email"
                  required
                  placeholder="panitia.pmb@muliaangkasa.ac.id"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kata Sandi Sementara
                </label>
                <input
                  type="text"
                  required
                  placeholder="Minimal 6 karakter..."
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pilih Tingkat Akses (Role)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, role: 'ADMIN' })}
                    className={`p-3 rounded-xl border text-left transition-all ${createForm.role === 'ADMIN'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                  >
                    <div className="font-bold text-xs">Admin Panitia</div>
                    <div className="text-[10px] mt-0.5 opacity-80">Verifikasi berkas & pendaftaran</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, role: 'SUPER_ADMIN' })}
                    className={`p-3 rounded-xl border text-left transition-all ${createForm.role === 'SUPER_ADMIN'
                      ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                  >
                    <div className="font-bold text-xs">Super Admin</div>
                    <div className="text-[10px] mt-0.5 opacity-80">Hak akses penuh ke semua fitur</div>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 active:scale-95 disabled:opacity-50"
                >
                  {createSubmitting ? 'Menyimpan...' : 'Buat Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Ubah Role */}
      {showRoleModal && targetUserRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setShowRoleModal(false)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Ubah Peran / Role Akses</h3>
                <p className="text-xs text-slate-400 truncate max-w-xs">{targetUserRole.email}</p>
              </div>
            </div>

            <div className="space-y-3 my-5">
              {[
                { role: 'SUPER_ADMIN', title: 'Super Admin', desc: 'Hak akses eksekutif penuh, audit log, kelola user & pengaturan PMB' },
                { role: 'ADMIN', title: 'Admin Panitia PMB', desc: 'Hak verifikasi berkas, validasi pembayaran, dan seleksi pendaftar' },
                { role: 'APPLICANT', title: 'Mahasiswa / Pelamar', desc: 'Pengguna portal biasa untuk pendaftaran dan unggah berkas' },
              ].map((opt) => (
                <button
                  key={opt.role}
                  type="button"
                  onClick={() => setNewRoleSelect(opt.role as any)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all ${newRoleSelect === opt.role
                    ? 'bg-purple-600/10 border-purple-500 text-purple-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{opt.title}</span>
                    {newRoleSelect === opt.role && <Check className="w-4 h-4 text-purple-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleChangeRole}
                disabled={roleSubmitting}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 active:scale-95 disabled:opacity-50"
              >
                {roleSubmitting ? 'Menyimpan...' : 'Perbarui Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Reset Password */}
      {showResetModal && targetUserPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setShowResetModal(false)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Kata Sandi Akun</h3>
                <p className="text-xs text-slate-400 truncate max-w-xs">{targetUserPass.email}</p>
              </div>
            </div>

            <div className="my-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Masukkan Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter..."
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordText(!showPasswordText)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Pengguna dapat langsung masuk dengan kata sandi baru ini.</span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetSubmitting || !newPasswordInput}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
              >
                {resetSubmitting ? 'Memproses...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
