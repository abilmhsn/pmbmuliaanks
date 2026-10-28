'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  BookOpen,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard Statistik', Icon: LayoutDashboard },
    { href: '/admin/applicants', label: 'Data Pendaftar', Icon: Users },
    { href: '/admin/master-data', label: 'Kelola Master Data', Icon: BookOpen },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <span className="text-sm font-extrabold tracking-wider text-white block leading-tight">
              ADMIN PANEL
            </span>
            <span className="text-[10px] text-amber-400 font-semibold tracking-wide">
              PMB Mulia Angkasa
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

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 text-xs font-semibold">
        {navLinks.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 active:scale-95 ${pathname === href
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 translate-x-1'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white hover:translate-x-1'
              }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/20 transition-all duration-200 shadow-sm active:scale-95 hover:shadow-rose-500/10"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Admin</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">

      {/* ── Mobile Top Bar ── */}
      <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Buka sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-slate-950" />
          </div>
          <span className="text-sm font-extrabold text-white tracking-wide">ADMIN PANEL</span>
        </div>
      </header>

      <div className="flex flex-1 md:flex-row relative">

        {/* ── Mobile overlay backdrop ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── Sidebar ── */}
        <aside className="hidden md:flex md:w-64 bg-slate-900/90 backdrop-blur-xl text-white flex-shrink-0 border-r border-slate-800/80 md:sticky md:top-0 md:h-screen flex-col z-30">
          <SidebarContent />
        </aside>

        <aside
          className={`fixed top-0 left-0 h-full w-72 bg-slate-900 text-white flex flex-col z-50 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <SidebarContent />
        </aside>

        {/* ── Main Content — Dirender konsisten tanpa early return di tingkat layout ── */}
        <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto bg-slate-950 transition-all duration-300">
          {isLoading ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin"></div>
                <p className="text-sm font-semibold text-slate-300">Memuat Portal Administrator...</p>
              </div>
            </div>
          ) : !user || user.role !== 'ADMIN' ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mb-4 border border-rose-500/30 shadow-lg">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Akses Terbatas Administrator</h2>
              <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
                Halaman ini khusus untuk Panitia & Administrator Kampus Mulia Angkasa.
              </p>
              <Link
                href="/login"
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95"
              >
                Login sebagai Admin
              </Link>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}