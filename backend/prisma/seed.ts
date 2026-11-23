import { PrismaClient, Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database PMB Kampus Mulia Angkasa...');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;
  const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

  // 1. Create Default Super Admin & Admin User in Supabase Auth & Prisma
  const usersToSeed = [
    {
      email: 'superadmin@muliaangkasa.ac.id',
      password: 'superadmin123',
      role: Role.SUPER_ADMIN,
    },
    {
      email: 'admin@muliaangkasa.ac.id',
      password: 'admin123',
      role: Role.ADMIN,
    },
  ];

  for (const item of usersToSeed) {
    let userId: string | undefined;

    if (supabase) {
      try {
        const { data: sbUser, error } = await supabase.auth.admin.createUser({
          email: item.email,
          password: item.password,
          email_confirm: true,
          user_metadata: { role: item.role },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            const { data: list } = await supabase.auth.admin.listUsers();
            const found = list.users.find((u) => u.email === item.email);
            if (found) userId = found.id;
          } else {
            console.warn(`Supabase Auth seed warning (${item.email}):`, error.message);
          }
        } else if (sbUser?.user) {
          userId = sbUser.user.id;
        }
      } catch (err: any) {
        console.warn(`Supabase create error (${item.email}):`, err.message);
      }
    }

    const seededUser = await prisma.user.upsert({
      where: { email: item.email },
      update: {
        role: item.role,
        ...(userId ? { id: userId } : {}),
      },
      create: {
        ...(userId ? { id: userId } : {}),
        email: item.email,
        role: item.role,
      },
    });
    console.log(`User seeded (${item.role}):`, seededUser.email, seededUser.id);
  }

  // Default System Settings
  const defaultSettings = [
    { key: 'REGISTRATION_OPEN', value: 'true', description: 'Status buka/tutup pendaftaran publik PMB' },
    { key: 'REGISTRATION_FEE', value: '250000', description: 'Biaya formulir pendaftaran PMB (Rupiah)' },
    { key: 'PAYMENT_BANK_NAME', value: 'Bank Mandiri', description: 'Nama Bank Rekening Kampus' },
    { key: 'PAYMENT_ACCOUNT_NUMBER', value: '137-00-1234567-8', description: 'Nomor Rekening Resmi Kampus' },
    { key: 'PAYMENT_ACCOUNT_HOLDER', value: 'Yayasan Mulia Angkasa Akademi', description: 'Atas Nama Rekening Kampus' },
    { key: 'HELP_DESK_PHONE', value: '081255401558', description: 'Nomor WhatsApp Helpdesk PMB' },
    { key: 'ANNOUNCEMENT_BANNER', value: 'Pendaftaran Mahasiswa Baru Gelombang 1 TA 2027/2028 telah dibuka! Segera lengkapi berkas dan verifikasi pendaftaran.', description: 'Teks banner pengumuman atas portal calon mahasiswa' },
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log('Default System Settings seeded.');

  // 2. Create Default PMB Period Gelombang 1
  const activePeriod = await prisma.pmbPeriod.upsert({
    where: { id: 'period-2027' },
    update: {
      name: 'PMB Gelombang 1',
    },
    create: {
      id: 'period-2027',
      year: '2027/2028',
      name: 'PMB Gelombang 1',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2027-08-31'),
      isActive: true,
    },
  });
  console.log('Active Period seeded:', activePeriod.name);

  // 3. Create Default Study Programs
  const prodis = [
    {
      code: 'AVSEC',
      name: 'Aviation Security (Avsec)',
      description: 'Program pendidikan dan pelatihan keamanan penerbangan berlisensi resmi.',
      quota: 40,
      tuitionFee: 15000000,
    },
    {
      code: 'FA',
      name: 'Flight Attendant (Pramugari/Pramugara)',
      description: 'Program pendidikan calon pramugari dan pramugara maskapai penerbangan.',
      quota: 30,
      tuitionFee: 25000000,
    },
    {
      code: 'GH',
      name: 'Ground Handling & Staff Bandara',
      description: 'Program keahlian operasional pelayanan darat bandar udara dan maskapai.',
      quota: 50,
      tuitionFee: 12500000,
    },
  ];

  for (const p of prodis) {
    await prisma.studyProgram.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
  }
  console.log('Study Programs seeded.');

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
