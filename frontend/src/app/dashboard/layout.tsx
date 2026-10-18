'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Plane,
  LayoutDashboard,
  Printer,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"></div>
          <p className="text-sm font-semibold text-slate-300">Memuat Dashboard PMB...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // AuthContext handles redirect
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header / Logo */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
            <img
              src="/logo-mulia.png"
              alt="Logo Mulia Angkasa"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-sm font-bold text-white block leading-tight">
              MULIA ANGKASA AKADEMIK
            </span>
            <span className="text-[10px] text-sky-400 font-semibold tracking-wider">
              Portal Calon Mahasiswa
            </span>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Tutup sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User Card */}
      <div className="p-4 mx-4 my-4 bg-slate-800/80 rounded-xl border border-slate-700/60">
        <div className="text-xs text-slate-400">Selamat datang,</div>
        <div className="font-bold text-sm text-white truncate">{user.applicant?.fullName || user.email}</div>
        <div className="text-[11px] font-mono text-amber-400 mt-1">
          No: {user.applicant?.registrationNumber || 'PMB-2026-PENDING'}
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-1 text-sm font-medium flex-1">
        <Link
          href="/dashboard"
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${pathname === '/dashboard'
            ? 'bg-sky-600 text-white font-bold shadow-lg shadow-sky-600/30'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard &amp; Status</span>
        </Link>

        <Link
          href="/dashboard/cetak-bukti"
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${pathname === '/dashboard/cetak-bukti'
            ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30'
            : 'text-amber-400 hover:bg-slate-800'
            }`}
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Bukti PMB</span>
        </Link>
      </nav>

      {/* Logout */}
      <div className="p-4 mt-auto border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Akun</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">

      {/* ── Mobile Top Bar ── */}
      <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-40 print:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Buka sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">Portal Calon Mahasiswa</span>
        </div>
        <span className="ml-auto text-[10px] font-mono text-amber-400 truncate max-w-[140px]">
          {user.applicant?.registrationNumber || 'PMB-2026-PENDING'}
        </span>
      </header>

      <div className="flex flex-1 relative">

        {/* ── Mobile overlay backdrop ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── Sidebar — Desktop (sticky) ── */}
        <aside className="hidden md:flex md:w-64 bg-slate-900 text-white flex-shrink-0 border-r border-slate-800 flex-col md:sticky md:top-0 md:h-screen print:hidden">
          <SidebarContent />
        </aside>

        {/* ── Sidebar — Mobile (drawer) ── */}
        <aside
          className={`fixed top-0 left-0 h-full w-72 bg-slate-900 text-white flex flex-col z-50 shadow-2xl transition-transform duration-300 ease-in-out md:hidden print:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <SidebarContent />
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
