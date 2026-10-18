import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database PMB Kampus Mulia Angkasa...');

  // 1. Create Default Admin User
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

  // 2. Create Default PMB Period
  const activePeriod = await prisma.pmbPeriod.upsert({
    where: { id: 'period-2026' },
    update: {},
    create: {
      id: 'period-2026',
      year: '2026/2027',
      name: 'Penerimaan Mahasiswa Baru Gelombang I 2026/2027',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    },
  });
  console.log('PMB Period seeded:', activePeriod.name);

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
