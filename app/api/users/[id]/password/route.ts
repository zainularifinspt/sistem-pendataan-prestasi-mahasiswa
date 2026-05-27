import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";

import { requireRole } from "@/lib/api/authz";
import { jsonError, jsonOk } from "@/lib/api/response";
import { db } from "@/lib/db";
import { account, user } from "@/lib/db/schema";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { response } = await requireRole(["ADMIN"]);

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const password = String(body?.password ?? "");

  if (password.length < 8) {
    return jsonError("Password baru minimal 8 karakter.", 422);
  }

  const [targetUser] = await db.select().from(user).where(eq(user.id, id)).limit(1);

  if (!targetUser) {
    return jsonError("Pengguna tidak ditemukan.", 404);
  }

  const hashedPassword = await hashPassword(password);
  const [updatedAccount] = await db
    .update(account)
    .set({
      password: hashedPassword,
      updatedAt: new Date(),
    })
    .where(eq(account.userId, id))
    .returning();

  if (!updatedAccount) {
    await db.insert(account).values({
      id: `acc-${id}`,
      accountId: id,
      providerId: "credential",
      userId: id,
      password: hashedPassword,
    });
  }

  return jsonOk({ success: true });
}
