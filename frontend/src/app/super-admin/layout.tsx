'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Crown,
  LayoutDashboard,
  Users,
  ShieldCheck,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Sun,
  Moon,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  SuperAdminThemeProvider,
  useSuperAdminTheme,
} from '@/context/SuperAdminThemeContext';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuperAdminThemeProvider>
      <SuperAdminLayoutContent>{children}</SuperAdminLayoutContent>
    </SuperAdminThemeProvider>
  );
}

function SuperAdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const { isDark, toggleTheme } = useSuperAdminTheme();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
    {
      href: '/super-admin/dashboard',
      label: 'Executive Overview',
      subtitle: 'Statistik & Keuangan',
      Icon: LayoutDashboard,
    },
    {
      href: '/super-admin/users',
      label: 'Kelola Tim & Akun',
      subtitle: 'Admin, Panitia & User',
      Icon: Users,
    },
    {
      href: '/super-admin/audit-logs',
      label: 'Audit Log & Integritas',
      subtitle: 'Riwayat Seluruh Tindakan',
      Icon: Activity,
    },
    {
      href: '/super-admin/settings',
      label: 'Pengaturan Global PMB',
      subtitle: 'Status Buka/Tutup & Bank',
      Icon: Settings,
    },
  ];

  const SidebarContent = () => (
    <div
      className={`flex flex-col h-full border-r transition-colors ${
        isDark
          ? 'bg-slate-900 border-slate-800/80 text-white'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-amber-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Crown className="w-5 h-5 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-1">
              <span
                className={`text-xs font-black tracking-widest uppercase ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                SUPER ADMIN
              </span>
            </div>
            <span
              className={`text-[10px] font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              PMB Mulia Angkasa Akademi
            </span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className={`md:hidden p-1.5 rounded-lg transition-colors ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          aria-label="Tutup sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User Info Bar */}
      <div
        className={`px-4 py-3 mx-4 mt-4 rounded-xl border flex items-center justify-between transition-colors ${
          isDark
            ? 'bg-slate-800/50 border-slate-700/50 text-slate-200'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}
      >
        <div className="min-w-0 pr-2">
          <p
            className={`text-[10px] ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Masuk sebagai:
          </p>
          <p className="text-xs font-semibold truncate">
            {user?.email || 'superadmin@muliaangkasa.ac.id'}
          </p>
        </div>
        <span
          className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"
          title="Online"
        />
      </div>

      {/* Theme Toggle Bar (Sidebar Desktop) */}
      <div
        className={`px-3.5 py-2.5 mx-4 mt-3 rounded-xl border flex items-center justify-between transition-colors ${
          isDark
            ? 'bg-slate-800/40 border-slate-800 text-slate-300'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-semibold">
          {isDark ? (
            <Moon className="w-4 h-4 text-purple-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span>{isDark ? 'Mode Gelap' : 'Mode Terang'}</span>
        </div>
        <button
          onClick={toggleTheme}
          type="button"
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
            isDark
              ? 'bg-slate-700 hover:bg-slate-600 text-amber-300 border border-slate-600'
              : 'bg-white hover:bg-slate-100 text-purple-700 border border-slate-200 shadow-sm'
          }`}
          title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-300" />
              <span>Terang</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-purple-700" />
              <span>Gelap</span>
            </>
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 text-xs font-semibold overflow-y-auto">
        <div
          className={`text-[10px] uppercase font-bold px-3 py-1 tracking-wider ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          Menu Utama Eksekutif
        </div>
        {navLinks.map(({ href, label, subtitle, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-start gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/25 translate-x-1'
                  : isDark
                  ? 'text-slate-400 hover:bg-slate-800/70 hover:text-white hover:translate-x-1'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-1'
              }`}
            >
              <Icon
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  isActive
                    ? 'text-white'
                    : isDark
                    ? 'text-purple-400'
                    : 'text-purple-600'
                }`}
              />
              <div className="leading-snug">
                <div className="text-xs font-semibold">{label}</div>
                <div
                  className={`text-[10px] ${
                    isActive
                      ? 'text-purple-100'
                      : isDark
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }`}
                >
                  {subtitle}
                </div>
              </div>
            </Link>
          );
        })}

        {/* Shortcut to Admin Panel */}
        <div
          className={`pt-4 border-t mt-4 ${
            isDark ? 'border-slate-800/80' : 'border-slate-200'
          }`}
        >
          <div
            className={`text-[10px] uppercase font-bold px-3 py-1 tracking-wider ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Akses Panel Panitia
          </div>
          <Link
            href="/admin/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all text-xs font-semibold group ${
              isDark
                ? 'bg-slate-800/40 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border-amber-500/20'
                : 'bg-amber-50/70 hover:bg-amber-100 text-amber-800 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Panel Operasional</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          </Link>
        </div>
      </nav>

      {/* Logout */}
      <div
        className={`p-4 border-t ${
          isDark
            ? 'border-slate-800/80 bg-slate-950/60'
            : 'border-slate-200 bg-slate-50'
        }`}
      >
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold rounded-xl border border-rose-500/20 transition-all duration-200 active:scale-95 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Super Admin</span>
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen flex flex-col selection:bg-purple-500 selection:text-white transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100/70 text-slate-900'
      }`}
    >
      {/* Mobile Top Bar */}
      <header
        className={`md:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
          isDark
            ? 'bg-slate-900/95 border-slate-800 text-white'
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`p-2 rounded-xl transition-colors ${
              isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-label="Buka navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-500 to-amber-400 flex items-center justify-center shadow-md shadow-purple-500/20">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <span
                className={`text-xs font-black tracking-wider block leading-none ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                SUPER ADMIN
              </span>
              <span
                className={`text-[9px] font-medium leading-none ${
                  isDark ? 'text-purple-300/80' : 'text-purple-600'
                }`}
              >
                Mulia Angkasa PMB
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Mobile Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            type="button"
            className={`p-2 rounded-xl transition-all border active:scale-95 ${
              isDark
                ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-100 text-purple-700 border-slate-200 hover:bg-slate-200'
            }`}
            title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            aria-label="Toggle tema gelap atau terang"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link
            href="/admin/dashboard"
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border flex items-center gap-1 active:scale-95 transition-all ${
              isDark
                ? 'bg-amber-400/10 text-amber-300 border-amber-400/20'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Panitia</span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 md:flex-row relative">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex md:w-64 flex-shrink-0 md:sticky md:top-0 md:h-screen flex-col z-30 transition-colors ${
            isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
          }`}
        >
          <SidebarContent />
        </aside>

        {/* Mobile Drawer */}
        <aside
          className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] flex flex-col z-50 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
        >
          <SidebarContent />
        </aside>

        {/* Content View */}
        <main
          className={`flex-1 w-full min-w-0 p-3.5 sm:p-5 md:p-8 pb-24 md:pb-8 overflow-y-auto overflow-x-hidden transition-colors duration-200 ${
            isDark ? 'bg-slate-950' : 'bg-slate-100/70'
          }`}
        >
          {isLoading ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                <p
                  className={`text-xs font-semibold ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Memuat Portal Super Admin...
                </p>
              </div>
            </div>
          ) : !user || user.role !== 'SUPER_ADMIN' ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mb-4 border border-rose-500/30 shadow-lg">
                <Crown className="w-8 h-8" />
              </div>
              <h2
                className={`text-xl font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Akses Khusus Super Administrator
              </h2>
              <p
                className={`text-xs max-w-md mb-6 leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Halaman ini diperuntukkan bagi pimpinan dan pengelola sistem utama PMB Kampus Mulia Angkasa.
                Akun Anda saat ini tidak memiliki hak akses Super Admin.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/dashboard"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95"
                >
                  Buka Panel Admin
                </Link>
                <Link
                  href="/login"
                  className={`px-5 py-2.5 font-bold text-xs rounded-xl transition-all ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-white'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                  }`}
                >
                  Ganti Akun
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex items-center justify-around px-2 py-2 shadow-2xl backdrop-blur-xl transition-colors duration-200 ${
          isDark
            ? 'bg-slate-900/95 border-slate-800/90'
            : 'bg-white/95 border-slate-200 shadow-lg'
        }`}
      >
        {navLinks.map(({ href, label, Icon }) => {
          const isActive = pathname === href;
          const shortLabel =
            href.includes('dashboard')
              ? 'Ikhtisar'
              : href.includes('users')
              ? 'Tim & Akun'
              : href.includes('audit-logs')
              ? 'Audit Log'
              : 'Pengaturan';
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
                isActive
                  ? isDark
                    ? 'text-purple-300 font-extrabold'
                    : 'text-purple-700 font-extrabold'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 font-medium'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? isDark
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm'
                      : 'bg-purple-100 text-purple-700 border border-purple-200'
                    : ''
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? isDark
                        ? 'text-purple-300'
                        : 'text-purple-700'
                      : isDark
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`}
                />
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[70px]">
                {shortLabel}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
