import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database PMB Kampus Mulia Angkasa...');

  // 1. Create Default Super Admin & Admin User
  const superAdminPassword = await bcrypt.hash('superadmin123', 10);
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@muliaangkasa.ac.id' },
    update: {
      role: Role.SUPER_ADMIN,
    },
    create: {
      email: 'superadmin@muliaangkasa.ac.id',
      password: superAdminPassword,
      role: Role.SUPER_ADMIN,
    },
  });
  console.log('Super Admin user seeded:', superAdminUser.email);

  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@muliaangkasa.ac.id' },
    update: {},
    create: {
      email: 'admin@muliaangkasa.ac.id',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log('Admin user seeded:', adminUser.email);

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
      name: 'PMB Gelombang 1', // 👈 Update nama jika id sudah ada di DB
    },
    create: {
      id: 'period-2027',
      year: '2027/2028',
      name: 'PMB Gelombang 1', // 👈 Ubah teks di sini
      startDate: new Date('2027-01-01'),
      endDate: new Date('2027-12-31'),
      isActive: true,
    },
  });
  console.log('PMB Period seeded:', activePeriod.name);

  // 3. Create Default PMB Period Gelombang 2 (TAMBAHKAN INI)
  const waveTwoPeriod = await prisma.pmbPeriod.upsert({
    where: { id: 'period-2027-wave2' },
    update: {
      name: 'PMB Gelombang 2',
    },
    create: {
      id: 'period-2027-wave2',
      year: '2027/2028',
      name: 'PMB Gelombang 2',
      startDate: new Date('2027-07-01'),
      endDate: new Date('2027-12-31'),
      isActive: false,
    },
  });
  console.log('PMB Period seeded:', waveTwoPeriod.name);

  // 3. Create Default Study Programs 
  const alcProgram = await prisma.studyProgram.upsert({
    where: { code: 'ALC' },
    update: {},
    create: {
      code: 'ALC',
      name: 'Air Lines Crew (Pramugari/Pramutra & Staff Bandara)',
      description: 'Program keahlian khusus siap kerja untuk menjadi Cabin Crew (Pramugari/Pramutra) profesional dan Ground Handling Staff Bandara Internasional.',
      quota: 60,
      tuitionFee: 15000000,
      isActive: true,
    },
  });

  const avsecProgram = await prisma.studyProgram.upsert({
    where: { code: 'AVSEC' },
    update: {},
    create: {
      code: 'AVSEC',
      name: 'AVSEC (Aviation Security / Keamanan Bandara)',
      description: 'Program pendidikan & pelatihan khusus personel Keamanan Penerbangan (Aviation Security) bersertifikat lisensi resmi.',
      quota: 50,
      tuitionFee: 12500000,
      isActive: true,
    },
  });

  console.log('Study programs seeded:', alcProgram.name, '&', avsecProgram.name);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
