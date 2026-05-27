import type { Achievement, Category, JenisPrestasi, TingkatPrestasi, User } from "@/lib/types";

type ApiEnvelope<T> = {
  data?: T;
  error?: string;
};

export type AchievementInput = {
  category_id: string;
  nama_kegiatan: string;
  jenis_prestasi: JenisPrestasi;
  tingkat_prestasi: TingkatPrestasi;
  juara_peringkat: string;
  penyelenggara: string;
  tanggal_kegiatan: string;
  bukti_url?: string;
};

export type CategoryInput = {
  nama_kategori: string;
  keterangan: string;
  is_active?: boolean;
};

export type UserInput = {
  role?: "MAHASISWA" | "DOSEN" | "ADMIN";
  nim_nip: string;
  nama_lengkap: string;
  program_studi?: string;
  angkatan?: number;
  email: string;
  no_hp?: string;
  password: string;
};

export type StatsResponse = {
  summary: {
    total: number;
    activeStudents: number;
    nationalAndInternational: number;
    topCategory: string;
  };
  trends: { year: string; total: number }[];
  categories: { name: string; value: number }[];
  cohorts: { angkatan: string; total: number }[];
  levels: { name: string; value: number }[];
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });
  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed");
  }

  if (!("data" in payload)) {
    throw new Error("Invalid API response");
  }

  return payload.data as T;
}

function buildAchievementQuery(filters: {
  nim?: string;
  nama?: string;
  angkatan?: number;
  tahun?: number;
  tingkat?: string;
  kategori?: string;
  jenis?: string;
}) {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `/api/achievements?${query}` : "/api/achievements";
}

export const apiClient = {
  me: () => apiFetch<User>("/api/me"),
  categories: () => apiFetch<Category[]>("/api/categories"),
  stats: () => apiFetch<StatsResponse>("/api/stats"),
  achievements: (filters = {}) => apiFetch<Achievement[]>(buildAchievementQuery(filters)),
  users: () => apiFetch<User[]>("/api/users"),
  createAchievement: (input: AchievementInput) =>
    apiFetch<Achievement>("/api/achievements", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  createCategory: (input: CategoryInput) =>
    apiFetch<Category>("/api/categories", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  createUser: (input: UserInput) =>
    apiFetch<User>("/api/users", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  resetUserPassword: (userId: string, password: string) =>
    apiFetch<{ success: boolean }>(`/api/users/${userId}/password`, {
      method: "PATCH",
      body: JSON.stringify({ password }),
    }),
  changePassword: (input: { current_password: string; new_password: string }) =>
    apiFetch<{ success: boolean }>("/api/me/password", {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
};
