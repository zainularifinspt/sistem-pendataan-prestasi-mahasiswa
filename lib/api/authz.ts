import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { jsonError } from "@/lib/api/response";
import type { User, UserRole } from "@/lib/types";

type SessionUser = typeof auth.$Infer.Session.user & {
  role?: UserRole;
  nimNip?: string;
  programStudi?: string;
  angkatan?: number;
  noHp?: string;
  fotoProfilUrl?: string;
};

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (session?.user ?? null) as SessionUser | null;
}

export function mapSessionUser(row: SessionUser): User {
  return {
    id: row.id,
    role: row.role ?? "MAHASISWA",
    nim_nip: row.nimNip ?? "",
    nama_lengkap: row.name,
    program_studi: row.programStudi ?? "Pendidikan Matematika",
    angkatan: row.angkatan ?? undefined,
    email: row.email,
    no_hp: row.noHp ?? "",
    foto_profil_url: row.fotoProfilUrl ?? undefined,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    return { user: null, response: jsonError("Unauthorized", 401) };
  }

  return { user, response: null };
}

export async function requireRole(roles: UserRole[]) {
  const result = await requireUser();

  if (result.response || !result.user) {
    return result;
  }

  if (!result.user.role || !roles.includes(result.user.role)) {
    return { user: null, response: jsonError("Forbidden", 403) };
  }

  return result;
}
