import { hashPassword, verifyPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";

import { requireUser } from "@/lib/api/authz";
import { jsonError, jsonOk } from "@/lib/api/response";
import { db } from "@/lib/db";
import { account } from "@/lib/db/schema";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const { user, response } = await requireUser();

  if (response || !user) {
    return response;
  }

  const body = await request.json().catch(() => null);
  const currentPassword = String(body?.current_password ?? "");
  const newPassword = String(body?.new_password ?? "");

  if (!currentPassword || newPassword.length < 8) {
    return jsonError("Password lama wajib diisi dan password baru minimal 8 karakter.", 422);
  }

  const [credentialAccount] = await db
    .select()
    .from(account)
    .where(eq(account.userId, user.id))
    .limit(1);

  if (!credentialAccount?.password) {
    return jsonError("Akun belum memiliki password credential.", 404);
  }

  const isCurrentPasswordValid = await verifyPassword({
    password: currentPassword,
    hash: credentialAccount.password,
  });

  if (!isCurrentPasswordValid) {
    return jsonError("Password lama tidak sesuai.", 403);
  }

  await db
    .update(account)
    .set({
      password: await hashPassword(newPassword),
      updatedAt: new Date(),
    })
    .where(eq(account.id, credentialAccount.id));

  return jsonOk({ success: true });
}
