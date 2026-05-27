import { hashPassword } from "better-auth/crypto";
import { config } from "dotenv";

import { db, pool } from "../lib/db";
import { account, achievements, categories, user } from "../lib/db/schema";
import { achievements as achievementSeeds, categories as categorySeeds, users as userSeeds } from "./seed-data";

config({ path: ".env.local" });
config();

const demoPassword = process.env.SEED_DEMO_PASSWORD ?? "prestasi-demo";

async function seedUsers() {
  const password = await hashPassword(demoPassword);

  for (const seed of userSeeds) {
    await db
      .insert(user)
      .values({
        id: seed.id,
        name: seed.nama_lengkap,
        email: seed.email,
        emailVerified: true,
        username: seed.nim_nip,
        displayUsername: seed.nim_nip,
        role: seed.role,
        nimNip: seed.nim_nip,
        programStudi: seed.program_studi,
        angkatan: seed.angkatan,
        noHp: seed.no_hp,
        fotoProfilUrl: seed.foto_profil_url,
      })
      .onConflictDoUpdate({
        target: user.id,
        set: {
          name: seed.nama_lengkap,
          email: seed.email,
          username: seed.nim_nip,
          displayUsername: seed.nim_nip,
          role: seed.role,
          nimNip: seed.nim_nip,
          programStudi: seed.program_studi,
          angkatan: seed.angkatan,
          noHp: seed.no_hp,
          fotoProfilUrl: seed.foto_profil_url,
          updatedAt: new Date(),
        },
      });

    await db
      .insert(account)
      .values({
        id: `acc-${seed.id}`,
        userId: seed.id,
        accountId: seed.id,
        providerId: "credential",
        password,
      })
      .onConflictDoUpdate({
        target: account.id,
        set: {
          password,
          updatedAt: new Date(),
        },
      });
  }
}

async function seedCategories() {
  for (const seed of categorySeeds) {
    await db
      .insert(categories)
      .values({
        id: seed.id,
        namaKategori: seed.nama_kategori,
        keterangan: seed.keterangan,
        isActive: seed.is_active,
      })
      .onConflictDoUpdate({
        target: categories.id,
        set: {
          namaKategori: seed.nama_kategori,
          keterangan: seed.keterangan,
          isActive: seed.is_active,
          updatedAt: new Date(),
        },
      });
  }
}

async function seedAchievements() {
  for (const seed of achievementSeeds) {
    await db
      .insert(achievements)
      .values({
        id: seed.id,
        userId: seed.user_id,
        categoryId: seed.category_id,
        namaKegiatan: seed.nama_kegiatan,
        jenisPrestasi: seed.jenis_prestasi,
        tingkatPrestasi: seed.tingkat_prestasi,
        juaraPeringkat: seed.juara_peringkat,
        penyelenggara: seed.penyelenggara,
        tanggalKegiatan: new Date(seed.tanggal_kegiatan),
        buktiUrl: seed.bukti_url,
        statusRiwayat: seed.status_riwayat,
        createdAt: new Date(seed.created_at),
        updatedAt: new Date(seed.updated_at),
      })
      .onConflictDoUpdate({
        target: achievements.id,
        set: {
          userId: seed.user_id,
          categoryId: seed.category_id,
          namaKegiatan: seed.nama_kegiatan,
          jenisPrestasi: seed.jenis_prestasi,
          tingkatPrestasi: seed.tingkat_prestasi,
          juaraPeringkat: seed.juara_peringkat,
          penyelenggara: seed.penyelenggara,
          tanggalKegiatan: new Date(seed.tanggal_kegiatan),
          buktiUrl: seed.bukti_url,
          statusRiwayat: seed.status_riwayat,
          updatedAt: new Date(seed.updated_at),
        },
      });
  }
}

async function main() {
  await seedUsers();
  await seedCategories();
  await seedAchievements();
  console.log(`Seeded demo data. Password for every demo account: ${demoPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
