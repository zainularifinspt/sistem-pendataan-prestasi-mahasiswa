import { getCurrentUser, mapSessionUser } from "@/lib/api/authz";
import { jsonError, jsonOk } from "@/lib/api/response";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  return jsonOk(mapSessionUser(user));
}
