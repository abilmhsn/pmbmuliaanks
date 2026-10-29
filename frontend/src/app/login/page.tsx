'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Plane, Mail, Lock, ArrowRight, KeyRound } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await login(formData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal. Periksa email & password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link href="/" className="inline-flex items-center space-x-3 group mb-4">

          <div className="relative w-12 h-12 flex items-center justify-center">
            <Image
              src="/logo-mulia.png"
              alt="Logo Mulia Angkasa"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>

          <div className="text-left">
            <span className="text-base font-extrabold text-white tracking-tight">
              MULIA ANGKASA AKADEMI
            </span>
            <span className="block text-[10px] font-semibold text-sky-400 tracking-wider uppercase">
              Portal PMB
            </span>
          </div>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Masuk ke Portal Pendaftaran
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          Belum memiliki akun?{' '}
          <Link href="/register" className="font-semibold text-amber-400 hover:underline">
            Daftar Mahasiswa Baru
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-700 sm:px-10">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="nama@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Lupa Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Masukkan password Anda"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-amber-400 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-amber -500/20 hover:shadow-sky-500/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? 'Memproses...' : 'Masuk Portal'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Demo Accounts Info */}
          <div className="mt-6 pt-6 border-t border-slate-700/60 text-xs text-slate-400">




          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 max-w-sm w-full">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center mb-4">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Bantuan Lupa Password</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Untuk melakukan reset password akun PMB Anda, silakan hubungi Sekretariat Panitia PMB via WhatsApp dengan melampirkan NIK & Nama Lengkap.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowForgotModal(false)}
                className="w-1/2 py-2 text-xs font-semibold text-slate-300 border border-slate-700 rounded-xl"
              >
                Tutup
              </button>
              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20lupa%20password%20akun%20PMB"
                target="_blank"
                rel="noreferrer"
                className="w-1/2 py-2 text-xs font-bold text-center text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl"
              >
                Hubungi WA
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
