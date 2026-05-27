import type { Achievement, Category, User } from "../lib/types";

export const users: User[] = [
  {
    id: "usr-001",
    role: "MAHASISWA",
    nim_nip: "2021015001",
    nama_lengkap: "Aisyah Putri Ramadhani",
    program_studi: "Pendidikan Matematika",
    angkatan: 2021,
    email: "aisyah.putri@student.ac.id",
    no_hp: "081234567890",
  },
  {
    id: "usr-002",
    role: "MAHASISWA",
    nim_nip: "2022015012",
    nama_lengkap: "Muhammad Rizki Fauzan",
    program_studi: "Pendidikan Matematika",
    angkatan: 2022,
    email: "rizki.fauzan@student.ac.id",
    no_hp: "081234567891",
  },
  {
    id: "usr-003",
    role: "MAHASISWA",
    nim_nip: "2023015008",
    nama_lengkap: "Siti Nurhaliza",
    program_studi: "Pendidikan Matematika",
    angkatan: 2023,
    email: "siti.nurhaliza@student.ac.id",
    no_hp: "081234567892",
  },
  {
    id: "usr-004",
    role: "MAHASISWA",
    nim_nip: "2021015015",
    nama_lengkap: "Ahmad Firdaus",
    program_studi: "Pendidikan Matematika",
    angkatan: 2021,
    email: "ahmad.firdaus@student.ac.id",
    no_hp: "081234567893",
  },
  {
    id: "usr-005",
    role: "MAHASISWA",
    nim_nip: "2022015020",
    nama_lengkap: "Dewi Safitri",
    program_studi: "Pendidikan Matematika",
    angkatan: 2022,
    email: "dewi.safitri@student.ac.id",
    no_hp: "081234567894",
  },
  {
    id: "usr-006",
    role: "DOSEN",
    nim_nip: "198505152010121002",
    nama_lengkap: "Dr. Budi Santoso, M.Pd.",
    program_studi: "Pendidikan Matematika",
    email: "budi.santoso@dosen.ac.id",
    no_hp: "081234567895",
  },
  {
    id: "usr-007",
    role: "ADMIN",
    nim_nip: "199001012015032001",
    nama_lengkap: "Ratna Sari, S.Pd.",
    program_studi: "Pendidikan Matematika",
    email: "ratna.sari@admin.ac.id",
    no_hp: "081234567896",
  },
];

export const categories: Category[] = [
  {
    id: "cat-001",
    nama_kategori: "Akademik",
    keterangan: "Prestasi di bidang akademik seperti olimpiade, lomba karya tulis, dan penelitian",
    is_active: true,
  },
  {
    id: "cat-002",
    nama_kategori: "Olahraga",
    keterangan: "Prestasi di bidang olahraga seperti kejuaraan, turnamen, dan pertandingan",
    is_active: true,
  },
  {
    id: "cat-003",
    nama_kategori: "Seni & Budaya",
    keterangan: "Prestasi di bidang seni dan budaya seperti festival, pameran, dan pertunjukan",
    is_active: true,
  },
  {
    id: "cat-004",
    nama_kategori: "Teknologi",
    keterangan: "Prestasi di bidang teknologi seperti hackathon, kompetisi coding, dan inovasi digital",
    is_active: true,
  },
  {
    id: "cat-005",
    nama_kategori: "Kemanusiaan",
    keterangan: "Prestasi di bidang kemanusiaan seperti volunteer, pengabdian masyarakat, dan sosial",
    is_active: true,
  },
  {
    id: "cat-006",
    nama_kategori: "Kewirausahaan",
    keterangan: "Prestasi di bidang kewirausahaan seperti business plan, startup competition",
    is_active: false,
  },
];

export const achievements: Achievement[] = [
  {
    id: "ach-001",
    user_id: "usr-001",
    category_id: "cat-001",
    nama_kegiatan: "Olimpiade Matematika Nasional",
    jenis_prestasi: "INDIVIDUAL",
    tingkat_prestasi: "NASIONAL",
    juara_peringkat: "Juara 1",
    penyelenggara: "Kementerian Pendidikan dan Kebudayaan",
    tanggal_kegiatan: "2024-09-15",
    bukti_url: "/uploads/sertifikat-omn-2024.pdf",
    status_riwayat: "TERCATAT",
    created_at: "2024-09-20T10:30:00Z",
    updated_at: "2024-09-20T10:30:00Z",
  },
  {
    id: "ach-002",
    user_id: "usr-001",
    category_id: "cat-004",
    nama_kegiatan: "Hackathon Inovasi Digital Indonesia",
    jenis_prestasi: "KELOMPOK",
    tingkat_prestasi: "NASIONAL",
    juara_peringkat: "Juara 2",
    penyelenggara: "Kemenkominfo RI",
    tanggal_kegiatan: "2024-07-22",
    bukti_url: "/uploads/sertifikat-hackathon-2024.pdf",
    status_riwayat: "TERCATAT",
    created_at: "2024-07-25T14:00:00Z",
    updated_at: "2024-07-25T14:00:00Z",
  },
  {
    id: "ach-003",
    user_id: "usr-002",
    category_id: "cat-002",
    nama_kegiatan: "Kejuaraan Bulutangkis Antar Perguruan Tinggi",
    jenis_prestasi: "INDIVIDUAL",
    tingkat_prestasi: "LOKAL",
    juara_peringkat: "Juara 3",
    penyelenggara: "BAPOMI Provinsi",
    tanggal_kegiatan: "2024-05-10",
    bukti_url: "/uploads/sertifikat-badminton-2024.pdf",
    status_riwayat: "TERCATAT",
    created_at: "2024-05-12T09:00:00Z",
    updated_at: "2024-05-12T09:00:00Z",
  },
  {
    id: "ach-004",
    user_id: "usr-002",
    category_id: "cat-001",
    nama_kegiatan: "Lomba Karya Tulis Ilmiah Matematika",
    jenis_prestasi: "KELOMPOK",
    tingkat_prestasi: "NASIONAL",
    juara_peringkat: "Finalis",
    penyelenggara: "Universitas Gadjah Mada",
    tanggal_kegiatan: "2024-08-05",
    bukti_url: "/uploads/sertifikat-lkti-2024.pdf",
    status_riwayat: "TERCATAT",
    created_at: "2024-08-10T11:00:00Z",
    updated_at: "2024-08-10T11:00:00Z",
  },
  {
    id: "ach-005",
    user_id: "usr-003",
    category_id: "cat-003",
    nama_kegiatan: "Festival Tari Tradisional Nusantara",
    jenis_prestasi: "KELOMPOK",
    tingkat_prestasi: "NASIONAL",
    juara_peringkat: "Juara 1",
    penyelenggara: "Kementerian Pariwisata dan Ekonomi Kreatif",
    tanggal_kegiatan: "2024-10-20",
    bukti_url: "/uploads/sertifikat-tari-2024.pdf",
    status_riwayat: "TERCATAT",
    created_at: "2024-10-22T08:30:00Z",
    updated_at: "2024-10-22T08:30:00Z",
  },
  {
    id: "ach-006",
    user_id: "usr-003",
    category_id: "cat-005",
    nama_kegiatan: "Relawan Pendidikan Daerah 3T",
    jenis_prestasi: "INDIVIDUAL",
    tingkat_prestasi: "NASIONAL",
    juara_peringkat: "Peserta Terbaik",
    penyelenggara: "Yayasan Indonesia Mengajar",
    tanggal_kegiatan: "2024-06-15",
    bukti_url: "/uploads/sertifikat-relawan-2024.pdf",
    status_riwayat: "TERCATAT",
    created_at: "2024-06-20T10:00:00Z",
    updated_at: "2024-06-20T10:00:00Z",
  },
  {
    id: "ach-007",
    user_id: "usr-004",
    category_id: "cat-001",
    nama_kegiatan: "International Mathematics Competition",
    jenis_prestasi: "INDIVIDUAL",
    tingkat_prestasi: "INTERNASIONAL",
    juara_peringkat: "Silver Medal",
    penyelenggara: "International Mathematical Olympiad Foundation",
    tanggal_kegiatan: "2024-07-10",
    bukti_url: "/uploads/sertifikat-imc-2024.pdf",
    status_riwayat: "TERCATAT",
    created_at: "2024-07-15T12:00:00Z",
    updated_at: "2024-07-15T12:00:00Z",
  },
  {
    id: "ach-008",
    user_id: "usr-004",
    category_id: "cat-004",
    nama_kegiatan: "Google Solution Challenge",
    jenis_prestasi: "KELOMPOK",
    tingkat_prestasi: "INTERNASIONAL",
    juara_peringkat: "Top 50 Global",
    penyelenggara: "Google Developer Student Clubs",
    tanggal_kegiatan: "2024-04-20",
    bukti_url: "/uploads/sertifikat-gsc-2024.pdf",
    status_riwayat: "TERCATAT",
    created_at: "2024-04-25T15:00:00Z",
    updated_at: "2024-04-25T15:00:00Z",
  },
  {
    id: "ach-009",
    user_id: "usr-005",
    category_id: "cat-002",
    nama_kegiatan: "Kejuaraan Renang Mahasiswa Nasional",
    jenis_prestasi: "INDIVIDUAL",
    tingkat_prestasi: "NASIONAL",
    juara_peringkat: "Juara 2",
    penyelenggara: "BAPOMI Nasional",
    tanggal_kegiatan: "2024-11-08",
    bukti_url: "/uploads/sertifikat-renang-2024.pdf",
    status_riwayat: "TERCATAT",
    created_at: "2024-11-10T09:30:00Z",
    updated_at: "2024-11-10T09:30:00Z",
  },
  {
    id: "ach-010",
    user_id: "usr-005",
    category_id: "cat-001",
    nama_kegiatan: "Kompetisi Statistika Nasional",
    jenis_prestasi: "KELOMPOK",
    tingkat_prestasi: "NASIONAL",
    juara_peringkat: "Juara 3",
    penyelenggara: "Badan Pusat Statistik",
    tanggal_kegiatan: "2024-03-18",
    bukti_url: "/uploads/sertifikat-statistika-2024.pdf",
    status_riwayat: "TERCATAT",
    created_at: "2024-03-20T10:00:00Z",
    updated_at: "2024-03-20T10:00:00Z",
  },
  {
    id: "ach-011",
    user_id: "usr-001",
    category_id: "cat-001",
    nama_kegiatan: "Lomba Cerdas Cermat Matematika",
    jenis_prestasi: "KELOMPOK",
    tingkat_prestasi: "LOKAL",
    juara_peringkat: "Juara 1",
    penyelenggara: "Himpunan Matematika FKIP",
    tanggal_kegiatan: "2023-11-05",
    bukti_url: "/uploads/sertifikat-lcc-2023.pdf",
    status_riwayat: "TERCATAT",
    created_at: "2023-11-07T10:00:00Z",
    updated_at: "2023-11-07T10:00:00Z",
  },
  {
    id: "ach-012",
    user_id: "usr-002",
    category_id: "cat-003",
    nama_kegiatan: "Lomba Paduan Suara Tingkat Regional",
    jenis_prestasi: "KELOMPOK",
    tingkat_prestasi: "LOKAL",
    juara_peringkat: "Juara 2",
    penyelenggara: "Dinas Kebudayaan Provinsi",
    tanggal_kegiatan: "2023-12-10",
    bukti_url: "/uploads/sertifikat-padus-2023.pdf",
    status_riwayat: "TERCATAT",
    created_at: "2023-12-12T11:00:00Z",
    updated_at: "2023-12-12T11:00:00Z",
  },
  {
    id: "ach-013",
    user_id: "usr-001",
    category_id: "cat-005",
    nama_kegiatan: "Program Kampus Mengajar Batch 6",
    jenis_prestasi: "INDIVIDUAL",
    tingkat_prestasi: "NASIONAL",
    juara_peringkat: "Peserta Terbaik Regional",
    penyelenggara: "Kemendikbudristek",
    tanggal_kegiatan: "2024-01-15",
    bukti_url: "/uploads/sertifikat-km-2024.pdf",
    status_riwayat: "TERCATAT",
    created_at: "2024-01-20T08:00:00Z",
    updated_at: "2024-01-20T08:00:00Z",
  },
  {
    id: "ach-014",
    user_id: "usr-004",
    category_id: "cat-002",
    nama_kegiatan: "Liga Futsal Mahasiswa",
    jenis_prestasi: "KELOMPOK",
    tingkat_prestasi: "LOKAL",
    juara_peringkat: "Juara 1",
    penyelenggara: "BEM Universitas",
    tanggal_kegiatan: "2024-02-28",
    bukti_url: "/uploads/sertifikat-futsal-2024.pdf",
    status_riwayat: "TERCATAT",
    created_at: "2024-03-01T09:00:00Z",
    updated_at: "2024-03-01T09:00:00Z",
  },
  {
    id: "ach-015",
    user_id: "usr-003",
    category_id: "cat-004",
    nama_kegiatan: "UI/UX Design Competition",
    jenis_prestasi: "INDIVIDUAL",
    tingkat_prestasi: "NASIONAL",
    juara_peringkat: "Best Design Award",
    penyelenggara: "Tokopedia Academy",
    tanggal_kegiatan: "2024-08-25",
    bukti_url: "/uploads/sertifikat-uiux-2024.pdf",
    status_riwayat: "TERCATAT",
    created_at: "2024-08-28T14:00:00Z",
    updated_at: "2024-08-28T14:00:00Z",
  },
  {
    id: "ach-016",
    user_id: "usr-005",
    category_id: "cat-003",
    nama_kegiatan: "Festival Film Pendek Mahasiswa",
    jenis_prestasi: "KELOMPOK",
    tingkat_prestasi: "NASIONAL",
    juara_peringkat: "Nominasi Terbaik",
    penyelenggara: "Pusbangfilm Kemendikbud",
    tanggal_kegiatan: "2023-09-15",
    bukti_url: "/uploads/sertifikat-film-2023.pdf",
    status_riwayat: "DIARSIPKAN",
    created_at: "2023-09-18T10:00:00Z",
    updated_at: "2024-01-05T08:00:00Z",
  },
];

// Helper functions to get related data
export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getAchievementsByUser(userId: string): Achievement[] {
  return achievements.filter((a) => a.user_id === userId);
}

export function getAchievementsWithDetails(): (Achievement & { user: User; category: Category })[] {
  return achievements.map((a) => ({
    ...a,
    user: getUserById(a.user_id)!,
    category: getCategoryById(a.category_id)!,
  }));
}

// Chart data helpers
export function getTrendData(): { year: string; total: number }[] {
  return [
    { year: "2020", total: 8 },
    { year: "2021", total: 14 },
    { year: "2022", total: 22 },
    { year: "2023", total: 31 },
    { year: "2024", total: 45 },
  ];
}

export function getCategoryDistribution(): { name: string; value: number; fill: string }[] {
  const catCounts: Record<string, number> = {};
  achievements.forEach((a) => {
    const cat = getCategoryById(a.category_id);
    if (cat) {
      catCounts[cat.nama_kategori] = (catCounts[cat.nama_kategori] || 0) + 1;
    }
  });

  const colors = ["#ef4444", "#f59e0b", "#f97316", "#e11d48", "#fb923c", "#fbbf24"];
  return Object.entries(catCounts).map(([name, value], i) => ({
    name,
    value,
    fill: colors[i % colors.length],
  }));
}

export function getCohortData(): { angkatan: string; total: number }[] {
  const cohortCounts: Record<number, number> = {};
  achievements.forEach((a) => {
    const user = getUserById(a.user_id);
    if (user?.angkatan) {
      cohortCounts[user.angkatan] = (cohortCounts[user.angkatan] || 0) + 1;
    }
  });

  return Object.entries(cohortCounts)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([angkatan, total]) => ({ angkatan, total }));
}

export function getLevelDistribution(): { name: string; value: number }[] {
  const levelCounts: Record<string, number> = {};
  achievements.forEach((a) => {
    levelCounts[a.tingkat_prestasi] = (levelCounts[a.tingkat_prestasi] || 0) + 1;
  });
  return Object.entries(levelCounts).map(([name, value]) => ({ name, value }));
}

export function getMonthlyData(): { month: string; count: number }[] {
  return [
    { month: "Jan", count: 2 },
    { month: "Feb", count: 1 },
    { month: "Mar", count: 3 },
    { month: "Apr", count: 2 },
    { month: "May", count: 4 },
    { month: "Jun", count: 2 },
    { month: "Jul", count: 5 },
    { month: "Aug", count: 3 },
    { month: "Sep", count: 4 },
    { month: "Okt", count: 2 },
    { month: "Nov", count: 3 },
    { month: "Des", count: 1 },
  ];
}
