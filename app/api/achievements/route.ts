import { and, desc, eq, ilike, sql, type SQL } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { requireRole, requireUser } from "@/lib/api/authz";
import { mapAchievement } from "@/lib/api/achievement-mapper";
import { jsonError, jsonOk } from "@/lib/api/response";
import { db } from "@/lib/db";
import { achievements, categories, user } from "@/lib/db/schema";

export const runtime = "nodejs";

function parseDate(value: unknown) {
  if (typeof value !== "string") return null;
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export async function GET(request: Request) {
  const { user: currentUser, response } = await requireUser();

  if (response || !currentUser) {
    return response;
  }

  const { searchParams } = new URL(request.url);
  const conditions: SQL[] = [];

  if (currentUser.role === "MAHASISWA") {
    conditions.push(eq(achievements.userId, currentUser.id));
  }

  const nim = searchParams.get("nim");
  const nama = searchParams.get("nama");
  const angkatan = searchParams.get("angkatan");
  const tahun = searchParams.get("tahun");
  const tingkat = searchParams.get("tingkat");
  const kategori = searchParams.get("kategori");
  const jenis = searchParams.get("jenis");

  if (nim) conditions.push(ilike(user.nimNip, `%${nim}%`));
  if (nama) conditions.push(ilike(user.name, `%${nama}%`));
  if (angkatan) conditions.push(eq(user.angkatan, Number(angkatan)));
  if (tahun) conditions.push(sql`extract(year from ${achievements.tanggalKegiatan}) = ${Number(tahun)}`);
  if (tingkat) conditions.push(eq(achievements.tingkatPrestasi, tingkat as never));
  if (kategori) conditions.push(eq(achievements.categoryId, kategori));
  if (jenis) conditions.push(eq(achievements.jenisPrestasi, jenis as never));

  const rows = await db
    .select({
      achievement: achievements,
      user,
      category: categories,
    })
    .from(achievements)
    .innerJoin(user, eq(achievements.userId, user.id))
    .innerJoin(categories, eq(achievements.categoryId, categories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(achievements.createdAt));

  return jsonOk(
    rows.map((row) => mapAchievement(row.achievement, row.user, row.category))
  );
}

export async function POST(request: Request) {
  const { user: currentUser, response } = await requireRole(["MAHASISWA", "ADMIN"]);

  if (response || !currentUser) {
    return response;
  }

  const body = await request.json().catch(() => null);
  const tanggalKegiatan = parseDate(body?.tanggal_kegiatan);

  if (
    !body?.category_id ||
    !body?.nama_kegiatan ||
    !body?.jenis_prestasi ||
    !body?.tingkat_prestasi ||
    !body?.juara_peringkat ||
    !body?.penyelenggara ||
    !tanggalKegiatan
  ) {
    return jsonError("Achievement payload is incomplete", 422);
  }

  const targetUserId = currentUser.role === "ADMIN" && body.user_id ? body.user_id : currentUser.id;

  const [created] = await db
    .insert(achievements)
    .values({
      id: randomUUID(),
      userId: targetUserId,
      categoryId: body.category_id,
      namaKegiatan: body.nama_kegiatan,
      jenisPrestasi: body.jenis_prestasi,
      tingkatPrestasi: body.tingkat_prestasi,
      juaraPeringkat: body.juara_peringkat,
      penyelenggara: body.penyelenggara,
      tanggalKegiatan,
      buktiUrl: body.bukti_url ?? "/uploads/bukti-prestasi.pdf",
      statusRiwayat: "TERCATAT",
    })
    .returning();

  const [row] = await db
    .select({
      achievement: achievements,
      user,
      category: categories,
    })
    .from(achievements)
    .innerJoin(user, eq(achievements.userId, user.id))
    .innerJoin(categories, eq(achievements.categoryId, categories.id))
    .where(eq(achievements.id, created.id));

  return jsonOk(mapAchievement(row.achievement, row.user, row.category), { status: 201 });
}
