export type UserRole = "MAHASISWA" | "DOSEN" | "ADMIN";

export type JenisPrestasi = "INDIVIDUAL" | "KELOMPOK";

export type TingkatPrestasi = "LOKAL" | "NASIONAL" | "INTERNASIONAL";

export type StatusRiwayat = "TERCATAT" | "DIARSIPKAN";

export interface User {
  id: string;
  role: UserRole;
  nim_nip: string;
  nama_lengkap: string;
  program_studi: string;
  angkatan?: number;
  email: string;
  no_hp: string;
  foto_profil_url?: string;
}

export interface Category {
  id: string;
  nama_kategori: string;
  keterangan: string;
  is_active: boolean;
}

export interface Achievement {
  id: string;
  user_id: string;
  category_id: string;
  nama_kegiatan: string;
  jenis_prestasi: JenisPrestasi;
  tingkat_prestasi: TingkatPrestasi;
  juara_peringkat: string;
  penyelenggara: string;
  tanggal_kegiatan: string;
  bukti_url: string;
  status_riwayat: StatusRiwayat;
  created_at: string;
  updated_at: string;
  // Joined data (for display)
  user?: User;
  category?: Category;
}

export interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  colorClass: string;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface FilterOptions {
  nim?: string;
  nama?: string;
  angkatan?: number;
  tahun?: number;
  tingkat?: TingkatPrestasi | "";
  kategori?: string;
  jenis?: JenisPrestasi | "";
}
