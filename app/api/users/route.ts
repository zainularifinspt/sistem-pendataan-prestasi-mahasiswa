import { hashPassword } from "better-auth/crypto";
import { asc } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { requireRole } from "@/lib/api/authz";
import { mapUser } from "@/lib/api/achievement-mapper";
import { jsonError, jsonOk } from "@/lib/api/response";
import { db } from "@/lib/db";
import { account, user } from "@/lib/db/schema";
import type { UserRole } from "@/lib/types";

export const runtime = "nodejs";

function parseRole(value: unknown): UserRole {
  if (value === "DOSEN" || value === "ADMIN") return value;
  return "MAHASISWA";
}

export async function GET() {
  const { response } = await requireRole(["ADMIN"]);

  if (response) {
    return response;
  }

  const rows = await db.select().from(user).orderBy(asc(user.role), asc(user.name));

  return jsonOk(rows.map(mapUser));
}

export async function POST(request: Request) {
  const { response } = await requireRole(["ADMIN"]);

  if (response) {
    return response;
  }

  const body = await request.json().catch(() => null);
  const password = String(body?.password ?? "");
  const role = parseRole(body?.role);
  const nimNip = String(body?.nim_nip ?? "").trim();
  const name = String(body?.nama_lengkap ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const programStudi = String(body?.program_studi ?? "Pendidikan Matematika").trim();
  const angkatan = body?.angkatan ? Number(body.angkatan) : null;

  if (!nimNip || !name || !email || password.length < 8) {
    return jsonError("Data pengguna belum lengkap atau password kurang dari 8 karakter.", 422);
  }

  try {
    const created = await db.transaction(async (tx) => {
      const userId = randomUUID();
      const hashedPassword = await hashPassword(password);
      const [createdUser] = await tx
        .insert(user)
        .values({
          id: userId,
          name,
          email,
          emailVerified: true,
          username: nimNip,
          displayUsername: nimNip,
          role,
          nimNip,
          programStudi: programStudi || "Pendidikan Matematika",
          angkatan,
          noHp: String(body?.no_hp ?? "").trim() || null,
        })
        .returning();

      await tx.insert(account).values({
        id: `acc-${userId}`,
        accountId: userId,
        providerId: "credential",
        userId,
        password: hashedPassword,
      });

      return createdUser;
    });

    return jsonOk(mapUser(created), { status: 201 });
  } catch (error) {
    if (error instanceof Error && /duplicate key|unique/i.test(error.message)) {
      return jsonError("NIM/NIP atau email sudah terdaftar.", 409);
    }

    return jsonError("Pengguna gagal ditambahkan.", 500);
  }
}
