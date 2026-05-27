import { redirect } from "next/navigation";

import { LoginForm } from "@/components/app/login-form";
import { getCurrentUser } from "@/lib/api/authz";

export default async function LoginPage() {
  const user = await getCurrentUser().catch(() => null);

  if (user) {
    redirect("/");
  }

  return <LoginForm />;
}
