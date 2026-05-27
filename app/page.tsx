import { redirect } from "next/navigation";

import { PrestasiApp } from "@/components/app/prestasi-app";
import { getCurrentUser, mapSessionUser } from "@/lib/api/authz";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <PrestasiApp initialUser={mapSessionUser(user)} />;
}
