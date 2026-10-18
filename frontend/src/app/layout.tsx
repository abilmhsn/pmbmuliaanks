import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'PMB Kampus Mulia Angkasa - Penerimaan Mahasiswa Baru',
  description: 'Sistem Penerimaan Mahasiswa Baru Resmi Kampus Mulia Angkasa (Aviation & Ground Handling Specialist).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect"
          href="https://fonts.googleapis.com" />
        <link rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
