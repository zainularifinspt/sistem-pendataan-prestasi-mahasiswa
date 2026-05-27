import { eq } from "drizzle-orm";

import { requireUser } from "@/lib/api/authz";
import { mapAchievement } from "@/lib/api/achievement-mapper";
import { jsonError, jsonOk } from "@/lib/api/response";
import { db } from "@/lib/db";
import { achievements, categories, user } from "@/lib/db/schema";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function findAchievement(id: string) {
  const [row] = await db
    .select({
      achievement: achievements,
      user,
      category: categories,
    })
    .from(achievements)
    .innerJoin(user, eq(achievements.userId, user.id))
    .innerJoin(categories, eq(achievements.categoryId, categories.id))
    .where(eq(achievements.id, id));

  return row;
}

export async function GET(_request: Request, context: RouteContext) {
  const { user: currentUser, response } = await requireUser();

  if (response || !currentUser) {
    return response;
  }

  const { id } = await context.params;
  const row = await findAchievement(id);

  if (!row) {
    return jsonError("Achievement not found", 404);
  }

  if (currentUser.role === "MAHASISWA" && row.achievement.userId !== currentUser.id) {
    return jsonError("Forbidden", 403);
  }

  return jsonOk(mapAchievement(row.achievement, row.user, row.category));
}

export async function PATCH(request: Request, context: RouteContext) {
  const { user: currentUser, response } = await requireUser();

  if (response || !currentUser) {
    return response;
  }

  const { id } = await context.params;
  const existing = await findAchievement(id);

  if (!existing) {
    return jsonError("Achievement not found", 404);
  }

  if (currentUser.role === "MAHASISWA" && existing.achievement.userId !== currentUser.id) {
    return jsonError("Forbidden", 403);
  }

  const body = await request.json().catch(() => null);

  const [updated] = await db
    .update(achievements)
    .set({
      categoryId: body?.category_id,
      namaKegiatan: body?.nama_kegiatan,
      jenisPrestasi: body?.jenis_prestasi,
      tingkatPrestasi: body?.tingkat_prestasi,
      juaraPeringkat: body?.juara_peringkat,
      penyelenggara: body?.penyelenggara,
      tanggalKegiatan: body?.tanggal_kegiatan ? new Date(body.tanggal_kegiatan) : undefined,
      buktiUrl: body?.bukti_url,
      statusRiwayat: body?.status_riwayat,
      updatedAt: new Date(),
    })
    .where(eq(achievements.id, id))
    .returning();

  const row = await findAchievement(updated.id);

  if (!row) {
    return jsonError("Achievement not found", 404);
  }

  return jsonOk(mapAchievement(row.achievement, row.user, row.category));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { user: currentUser, response } = await requireUser();

  if (response || !currentUser) {
    return response;
  }

  if (currentUser.role !== "ADMIN") {
    return jsonError("Forbidden", 403);
  }

  const { id } = await context.params;
  const [deleted] = await db
    .delete(achievements)
    .where(eq(achievements.id, id))
    .returning();

  if (!deleted) {
    return jsonError("Achievement not found", 404);
  }

  return jsonOk({ id });
}
