import { eq } from "drizzle-orm";

import { requireUser } from "@/lib/api/authz";
import { jsonOk } from "@/lib/api/response";
import { db } from "@/lib/db";
import { achievements, categories, user } from "@/lib/db/schema";

export const runtime = "nodejs";

export async function GET() {
  const { response } = await requireUser();

  if (response) {
    return response;
  }

  const rows = await db
    .select({
      achievement: achievements,
      user,
      category: categories,
    })
    .from(achievements)
    .innerJoin(user, eq(achievements.userId, user.id))
    .innerJoin(categories, eq(achievements.categoryId, categories.id));

  const activeRows = rows.filter((row) => row.achievement.statusRiwayat === "TERCATAT");
  const activeStudents = new Set(activeRows.map((row) => row.achievement.userId)).size;
  const nationalAndInternational = activeRows.filter(
    (row) => row.achievement.tingkatPrestasi !== "LOKAL"
  ).length;

  const byYear = new Map<string, number>();
  const byCategory = new Map<string, number>();
  const byCohort = new Map<string, number>();
  const byLevel = new Map<string, number>();

  for (const row of rows) {
    const year = String(row.achievement.tanggalKegiatan.getFullYear());
    byYear.set(year, (byYear.get(year) ?? 0) + 1);
    byCategory.set(row.category.namaKategori, (byCategory.get(row.category.namaKategori) ?? 0) + 1);
    byLevel.set(row.achievement.tingkatPrestasi, (byLevel.get(row.achievement.tingkatPrestasi) ?? 0) + 1);

    if (row.user.angkatan) {
      const cohort = String(row.user.angkatan);
      byCohort.set(cohort, (byCohort.get(cohort) ?? 0) + 1);
    }
  }

  const topCategory =
    [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

  return jsonOk({
    summary: {
      total: activeRows.length,
      activeStudents,
      nationalAndInternational,
      topCategory,
    },
    trends: [...byYear.entries()]
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, total]) => ({ year, total })),
    categories: [...byCategory.entries()].map(([name, value]) => ({ name, value })),
    cohorts: [...byCohort.entries()]
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([angkatan, total]) => ({ angkatan, total })),
    levels: [...byLevel.entries()].map(([name, value]) => ({ name, value })),
  });
}
