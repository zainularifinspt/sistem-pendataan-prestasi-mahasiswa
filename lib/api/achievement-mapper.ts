import type { DbUser } from "@/lib/db/schema";
import type { Achievement, Category, User } from "@/lib/types";

type DbAchievementRow = {
  id: string;
  userId: string;
  categoryId: string;
  namaKegiatan: string;
  jenisPrestasi: "INDIVIDUAL" | "KELOMPOK";
  tingkatPrestasi: "LOKAL" | "NASIONAL" | "INTERNASIONAL";
  juaraPeringkat: string;
  penyelenggara: string;
  tanggalKegiatan: Date;
  buktiUrl: string;
  statusRiwayat: "TERCATAT" | "DIARSIPKAN";
  createdAt: Date;
  updatedAt: Date;
};

type DbCategoryRow = {
  id: string;
  namaKategori: string;
  keterangan: string;
  isActive: boolean;
};

export function mapUser(row: DbUser): User {
  return {
    id: row.id,
    role: row.role,
    nim_nip: row.nimNip,
    nama_lengkap: row.name,
    program_studi: row.programStudi,
    angkatan: row.angkatan ?? undefined,
    email: row.email,
    no_hp: row.noHp ?? "",
    foto_profil_url: row.fotoProfilUrl ?? undefined,
  };
}

export function mapCategory(row: DbCategoryRow): Category {
  return {
    id: row.id,
    nama_kategori: row.namaKategori,
    keterangan: row.keterangan,
    is_active: row.isActive,
  };
}

export function mapAchievement(
  row: DbAchievementRow,
  joinedUser?: DbUser,
  joinedCategory?: DbCategoryRow
): Achievement {
  return {
    id: row.id,
    user_id: row.userId,
    category_id: row.categoryId,
    nama_kegiatan: row.namaKegiatan,
    jenis_prestasi: row.jenisPrestasi,
    tingkat_prestasi: row.tingkatPrestasi,
    juara_peringkat: row.juaraPeringkat,
    penyelenggara: row.penyelenggara,
    tanggal_kegiatan: row.tanggalKegiatan.toISOString().slice(0, 10),
    bukti_url: row.buktiUrl,
    status_riwayat: row.statusRiwayat,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    user: joinedUser ? mapUser(joinedUser) : undefined,
    category: joinedCategory ? mapCategory(joinedCategory) : undefined,
  };
}
