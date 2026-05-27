import { desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { requireRole, requireUser } from "@/lib/api/authz";
import { mapCategory } from "@/lib/api/achievement-mapper";
import { jsonError, jsonOk } from "@/lib/api/response";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";

export const runtime = "nodejs";

export async function GET() {
  const { response } = await requireUser();

  if (response) {
    return response;
  }

  const rows = await db.select().from(categories).orderBy(desc(categories.isActive), categories.namaKategori);

  return jsonOk(rows.map(mapCategory));
}

export async function POST(request: Request) {
  const { response } = await requireRole(["ADMIN"]);

  if (response) {
    return response;
  }

  const body = await request.json().catch(() => null);

  if (!body?.nama_kategori || !body?.keterangan) {
    return jsonError("nama_kategori and keterangan are required", 422);
  }

  const [created] = await db
    .insert(categories)
    .values({
      id: randomUUID(),
      namaKategori: body.nama_kategori,
      keterangan: body.keterangan,
      isActive: body.is_active ?? true,
    })
    .returning();

  return jsonOk(mapCategory(created), { status: 201 });
}

export async function PATCH(request: Request) {
  const { response } = await requireRole(["ADMIN"]);

  if (response) {
    return response;
  }

  const body = await request.json().catch(() => null);

  if (!body?.id) {
    return jsonError("id is required", 422);
  }

  const [updated] = await db
    .update(categories)
    .set({
      namaKategori: body.nama_kategori,
      keterangan: body.keterangan,
      isActive: body.is_active,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, body.id))
    .returning();

  if (!updated) {
    return jsonError("Category not found", 404);
  }

  return jsonOk(mapCategory(updated));
}
