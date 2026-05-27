"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Award,
  BarChart3,
  CheckCircle2,
  Download,
  FileBadge2,
  FileSpreadsheet,
  Filter,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Sparkles,
  UploadCloud,
  UserPlus,
  UsersRound,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { apiClient, type StatsResponse } from "@/lib/api/client";
import { authClient } from "@/lib/auth-client";
import { formatDateShort } from "@/lib/utils";
import type { Achievement, Category, FilterOptions, JenisPrestasi, TingkatPrestasi, User, UserRole } from "@/lib/types";

type AchievementWithDetails = Achievement & { user: User; category: Category };

const navigationByRole: Record<UserRole, { value: string; label: string; icon: typeof LayoutDashboard }[]> = {
  MAHASISWA: [
    { value: "dashboard", label: "Statistik Jurusan", icon: BarChart3 },
    { value: "input", label: "Input Prestasi", icon: Plus },
    { value: "riwayat", label: "Riwayat", icon: FileBadge2 },
  ],
  DOSEN: [
    { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { value: "monitoring", label: "Monitoring", icon: Filter },
  ],
  ADMIN: [
    { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { value: "monitoring", label: "Monitoring", icon: Filter },
    { value: "kategori", label: "Kategori", icon: Settings2 },
    { value: "pengguna", label: "Pengguna", icon: UsersRound },
    { value: "password", label: "Password", icon: KeyRound },
  ],
};

const categoryColors = ["#ef4444", "#f59e0b", "#f97316", "#e11d48", "#10b981", "#6366f1"];

const defaultFilters: FilterOptions = {
  nim: "",
  nama: "",
  tingkat: "",
  kategori: "",
  jenis: "",
};

function hydrateAchievement(
  achievement: Achievement,
  categoryRows: Category[],
  currentUser: User | null
): AchievementWithDetails {
  const fallbackUser: User =
    currentUser ??
    ({
      id: achievement.user_id,
      role: "MAHASISWA",
      nim_nip: "-",
      nama_lengkap: "Mahasiswa",
      program_studi: "Pendidikan Matematika",
      email: "",
      no_hp: "",
    } satisfies User);
  const fallbackCategory: Category = {
    id: achievement.category_id,
    nama_kategori: "-",
    keterangan: "",
    is_active: true,
  };
  const user = achievement.user ?? fallbackUser;
  const category =
    achievement.category ??
    categoryRows.find((item) => item.id === achievement.category_id) ??
    fallbackCategory;

  return {
    ...achievement,
    user,
    category,
  };
}

function levelVariant(level: TingkatPrestasi) {
  if (level === "INTERNASIONAL") return "internasional";
  if (level === "NASIONAL") return "nasional";
  return "lokal";
}

function downloadCsv(rows: AchievementWithDetails[]) {
  const header = [
    "NIM/NIP",
    "Nama",
    "Angkatan",
    "Kategori",
    "Kegiatan",
    "Jenis",
    "Tingkat",
    "Peringkat",
    "Penyelenggara",
    "Tanggal",
    "Status",
  ];
  const body = rows.map((row) => [
    row.user.nim_nip,
    row.user.nama_lengkap,
    row.user.angkatan ?? "",
    row.category.nama_kategori,
    row.nama_kegiatan,
    row.jenis_prestasi,
    row.tingkat_prestasi,
    row.juara_peringkat,
    row.penyelenggara,
    row.tanggal_kegiatan,
    row.status_riwayat,
  ]);
  const csv = [header, ...body]
    .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "rekap-prestasi-pendidikan-matematika.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function downloadAccreditationExcel(filters: FilterOptions) {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  window.location.href = query ? `/api/export/achievements?${query}` : "/api/export/achievements";
}

function getPrintDate() {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function PrestasiApp({ initialUser }: { initialUser: User }) {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<User | null>(initialUser);
  const [activeTab, setActiveTab] = useState(initialUser.role === "MAHASISWA" ? "input" : "dashboard");
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [recentlySaved, setRecentlySaved] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataError, setDataError] = useState("");
  const [userMessage, setUserMessage] = useState("");

  const rows = useMemo(
    () => achievements.map((achievement) => hydrateAchievement(achievement, categories, sessionUser)),
    [achievements, categories, sessionUser]
  );
  const currentUserRows = useMemo(
    () => rows.filter((row) => row.user_id === sessionUser?.id),
    [rows, sessionUser?.id]
  );

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const year = new Date(row.tanggal_kegiatan).getFullYear();
      return (
        row.user.nim_nip.toLowerCase().includes(String(filters.nim ?? "").toLowerCase()) &&
        row.user.nama_lengkap.toLowerCase().includes(String(filters.nama ?? "").toLowerCase()) &&
        (!filters.angkatan || row.user.angkatan === filters.angkatan) &&
        (!filters.tahun || year === filters.tahun) &&
        (!filters.tingkat || row.tingkat_prestasi === filters.tingkat) &&
        (!filters.kategori || row.category_id === filters.kategori) &&
        (!filters.jenis || row.jenis_prestasi === filters.jenis)
      );
    });
  }, [filters, rows]);

  const dashboardStats = useMemo(() => {
    const activeRows = rows.filter((row) => row.status_riwayat === "TERCATAT");
    const activeStudents = new Set(activeRows.map((row) => row.user_id)).size;
    const nationalRows = activeRows.filter((row) => row.tingkat_prestasi !== "LOKAL").length;
    const topCategory =
      stats?.summary.topCategory ??
      [...(stats?.categories ?? [])].sort((a, b) => b.value - a.value)[0]?.name ??
      "-";

    return [
      {
        title: "Prestasi Tercatat",
        value: stats?.summary.total ?? activeRows.length,
        caption: "Data tersinkron dari database",
        icon: Award,
        className: "stat-card-red",
      },
      {
        title: "Mahasiswa Aktif",
        value: stats?.summary.activeStudents ?? activeStudents,
        caption: "Kontributor lintas angkatan",
        icon: UsersRound,
        className: "stat-card-yellow",
      },
      {
        title: "Nasional & Internasional",
        value: stats?.summary.nationalAndInternational ?? nationalRows,
        caption: "Bahan unggulan akreditasi",
        icon: Sparkles,
        className: "stat-card-orange",
      },
      {
        title: "Kategori Dominan",
        value: topCategory,
        caption: "Distribusi terbesar saat ini",
        icon: BarChart3,
        className: "stat-card-rose",
      },
    ];
  }, [rows, stats]);
  const activeCategories = useMemo(() => categories.filter((item) => item.is_active), [categories]);
  const trendData = stats?.trends ?? [];
  const categoryDistribution = stats?.categories ?? [];
  const cohortData = stats?.cohorts ?? [];
  const levelData = stats?.levels ?? [];

  const loadAppData = useCallback(async () => {
    setIsDataLoading(true);
    setDataError("");

    try {
      const [categoryRows, achievementRows, statsPayload, userRows] = await Promise.all([
        apiClient.categories(),
        apiClient.achievements(),
        apiClient.stats(),
        sessionUser?.role === "ADMIN" ? apiClient.users() : Promise.resolve([]),
      ]);

      setCategories(categoryRows);
      setSelectedCategoryId((current) => {
        if (current && categoryRows.some((category) => category.id === current && category.is_active)) {
          return current;
        }

        return categoryRows.find((category) => category.is_active)?.id ?? "";
      });
      setAchievements(achievementRows);
      setStats(statsPayload);
      setUsers(userRows);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Gagal memuat data dari server.");
    } finally {
      setIsDataLoading(false);
    }
  }, [sessionUser]);

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      try {
        await loadAppData();
      } finally {
        if (isActive) {
          setRecentlySaved(false);
        }
      }
    }

    loadData();

    return () => {
      isActive = false;
    };
  }, [loadAppData]);

  async function handleLogout() {
    await authClient.signOut();
    setSessionUser(null);
    setAchievements([]);
    setCategories([]);
    setStats(null);
    setRecentlySaved(false);
    setActiveTab("input");
    router.replace("/login");
    router.refresh();
  }

  async function handleSubmitAchievement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sessionUser) return;

    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setDataError("");

    try {
      const created = await apiClient.createAchievement({
        category_id: selectedCategoryId,
        nama_kegiatan: String(form.get("nama_kegiatan")),
        jenis_prestasi: String(form.get("jenis_prestasi")) as JenisPrestasi,
        tingkat_prestasi: String(form.get("tingkat_prestasi")) as TingkatPrestasi,
        juara_peringkat: String(form.get("juara_peringkat")),
        penyelenggara: String(form.get("penyelenggara")),
        tanggal_kegiatan: String(form.get("tanggal_kegiatan")),
        bukti_url: String(form.get("bukti_url")) || "/uploads/bukti-prestasi.pdf",
      });

      setAchievements((current) => [created, ...current]);
      setRecentlySaved(true);
      event.currentTarget.reset();
      await loadAppData();
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Data prestasi gagal disimpan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setDataError("");

    try {
      const created = await apiClient.createCategory({
        nama_kategori: String(form.get("nama_kategori")),
        keterangan: String(form.get("keterangan")),
        is_active: true,
      });

      setCategories((current) => [created, ...current]);
      event.currentTarget.reset();
      await loadAppData();
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Kategori gagal disimpan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    setIsSubmitting(true);
    setDataError("");
    setUserMessage("");

    try {
      const created = await apiClient.createUser({
        role: "MAHASISWA",
        nim_nip: String(form.get("nim_nip")),
        nama_lengkap: String(form.get("nama_lengkap")),
        program_studi: String(form.get("program_studi")) || "Pendidikan Matematika",
        angkatan: form.get("angkatan") ? Number(form.get("angkatan")) : undefined,
        email: String(form.get("email")),
        no_hp: String(form.get("no_hp") ?? ""),
        password,
      });

      setUsers((current) => [created, ...current]);
      setUserMessage(`Mahasiswa ${created.nama_lengkap} berhasil ditambahkan.`);
      event.currentTarget.reset();
      setUsers(await apiClient.users());
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Pengguna gagal ditambahkan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetUserPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const userId = String(form.get("user_id"));
    const password = String(form.get("password"));
    const targetUser = users.find((item) => item.id === userId);
    setIsSubmitting(true);
    setDataError("");
    setUserMessage("");

    try {
      await apiClient.resetUserPassword(userId, password);
      setUserMessage(`Password ${targetUser?.nama_lengkap ?? "pengguna"} berhasil direset.`);
      event.currentTarget.reset();
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Password pengguna gagal direset.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get("current_password"));
    const newPassword = String(form.get("new_password"));
    const confirmPassword = String(form.get("confirm_password"));
    setIsSubmitting(true);
    setDataError("");
    setUserMessage("");

    try {
      if (newPassword !== confirmPassword) {
        throw new Error("Konfirmasi password baru belum sama.");
      }

      await apiClient.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setUserMessage("Password akun Anda berhasil diganti.");
      event.currentTarget.reset();
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Password gagal diganti.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!sessionUser) {
    return null;
  }

  const navigation = navigationByRole[sessionUser.role];

  return (
    <main className="gradient-bg min-h-screen text-foreground">
      <PrintAchievementReport rows={currentUserRows} student={sessionUser} />

      <div className="screen-shell mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="glass-card-static rounded-3xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-amber-400 text-white shadow-lg">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-600">Sistem Prestasi Mahasiswa</p>
                <h1 className="text-xl font-black text-zinc-950 sm:text-2xl">Jurusan Pendidikan Matematika</h1>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 rounded-2xl border border-white/35 bg-white/35 px-3 py-2 backdrop-blur-xl">
                <Avatar className="h-9 w-9 border border-white/60">
                  <AvatarFallback className="bg-white/50 text-sm font-bold text-red-600">
                    {sessionUser.nama_lengkap
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-zinc-950">{sessionUser.nama_lengkap}</p>
                  <p className="text-xs font-medium text-zinc-600">{sessionUser.role}</p>
                </div>
              </div>
              <Button type="button" variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-2xl p-2">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <TabsTrigger key={item.value} value={item.value} className="gap-2 px-4 py-2">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {dataError ? (
            <div className="rounded-2xl border border-red-300/40 bg-red-50/70 px-4 py-3 text-sm font-semibold text-red-700 backdrop-blur-xl">
              {dataError}
            </div>
          ) : null}

          {userMessage ? (
            <div className="rounded-2xl border border-emerald-300/40 bg-emerald-50/70 px-4 py-3 text-sm font-semibold text-emerald-700 backdrop-blur-xl">
              {userMessage}
            </div>
          ) : null}

          {isDataLoading ? (
            <div className="rounded-2xl border border-white/40 bg-white/35 px-4 py-3 text-sm font-semibold text-zinc-700 backdrop-blur-xl">
              Memuat data terbaru dari server...
            </div>
          ) : null}

          <TabsContent value="input" className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <section className="glass-card-static rounded-3xl p-5 sm:p-6">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-red-600">Direct Record</p>
                    <h2 className="mt-1 text-2xl font-black text-zinc-950">Input Prestasi</h2>
                  </div>
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Tercatat
                  </Badge>
                </div>

                {recentlySaved ? (
                  <div className="mb-5 rounded-2xl border border-emerald-300/40 bg-emerald-50/60 px-4 py-3 text-sm font-semibold text-emerald-700 backdrop-blur">
                    Data prestasi berhasil ditambahkan ke riwayat lokal.
                  </div>
                ) : null}

                <form onSubmit={handleSubmitAchievement} className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nama_kegiatan">Nama kegiatan</Label>
                    <Input id="nama_kegiatan" name="nama_kegiatan" required placeholder="Olimpiade Matematika Nasional" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Kategori</Label>
                      <Select name="category_id" value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeCategories.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.nama_kategori}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tingkat</Label>
                      <Select name="tingkat_prestasi" defaultValue="NASIONAL">
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tingkat" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOKAL">Lokal</SelectItem>
                          <SelectItem value="NASIONAL">Nasional</SelectItem>
                          <SelectItem value="INTERNASIONAL">Internasional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Jenis</Label>
                      <Select name="jenis_prestasi" defaultValue="INDIVIDUAL">
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                          <SelectItem value="KELOMPOK">Kelompok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tanggal_kegiatan">Tanggal kegiatan</Label>
                      <Input id="tanggal_kegiatan" name="tanggal_kegiatan" type="date" required />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="juara_peringkat">Juara/peringkat</Label>
                      <Input id="juara_peringkat" name="juara_peringkat" required placeholder="Juara 1" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="penyelenggara">Penyelenggara</Label>
                      <Input id="penyelenggara" name="penyelenggara" required placeholder="Kemdikbudristek" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bukti_url">Bukti prestasi</Label>
                    <Input id="bukti_url" name="bukti_url" placeholder="/uploads/sertifikat.pdf" />
                  </div>

                  <Button type="submit" size="lg" className="mt-2" disabled={isSubmitting || !selectedCategoryId}>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Menyimpan..." : "Simpan Prestasi"}
                  </Button>
                </form>
              </section>

              <section className="glass-card-static rounded-3xl p-5 sm:p-6">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-amber-700">Rekap Pribadi</p>
                    <h2 className="mt-1 text-2xl font-black text-zinc-950">{currentUserRows.length} Prestasi</h2>
                  </div>
                  <Button type="button" variant="secondary" onClick={() => window.print()}>
                    <Download className="mr-2 h-4 w-4" />
                    Cetak PDF Rekap
                  </Button>
                </div>

                <AchievementTable rows={currentUserRows} compact />
              </section>
            </div>
          </TabsContent>

          <TabsContent value="riwayat" className="space-y-5">
            <section className="glass-card-static rounded-3xl p-5 sm:p-6">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-600">Riwayat Mahasiswa</p>
                  <h2 className="mt-1 text-2xl font-black text-zinc-950">Prestasi Saya</h2>
                </div>
                <Button type="button" variant="secondary" onClick={() => downloadCsv(currentUserRows)}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
              <AchievementTable rows={currentUserRows} />
            </section>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-5">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {dashboardStats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div key={stat.title} className={`glass-card-static rounded-3xl border p-5 ${stat.className}`}>
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/55 text-red-600 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-600">{stat.title}</p>
                    <p className="mt-2 truncate text-3xl font-black text-zinc-950">{stat.value}</p>
                    <p className="mt-2 text-sm font-medium text-zinc-600">{stat.caption}</p>
                  </div>
                );
              })}
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
              <div className="glass-card-static rounded-3xl p-5 sm:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-red-600">Tren Tahunan</p>
                    <h2 className="mt-1 text-xl font-black text-zinc-950">Pertumbuhan Prestasi</h2>
                  </div>
                  <Badge variant="warning">2020-2024</Badge>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ left: -16, right: 12, top: 12, bottom: 0 }}>
                      <defs>
                        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.42} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.04} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(113,113,122,0.18)" />
                      <XAxis dataKey="year" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.5)" }} />
                      <Area type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={3} fill="url(#trendFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card-static rounded-3xl p-5 sm:p-6">
                <div className="mb-6">
                  <p className="text-sm font-semibold text-amber-700">Distribusi</p>
                  <h2 className="mt-1 text-xl font-black text-zinc-950">Kategori Prestasi</h2>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryDistribution} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={4}>
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={entry.name} fill={categoryColors[index % categoryColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.5)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <ChartCard title="Performa Angkatan" eyebrow="Cohort" data={cohortData} xKey="angkatan" yKey="total" />
              <ChartCard title="Sebaran Tingkat" eyebrow="Level" data={levelData} xKey="name" yKey="value" />
            </section>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-5">
            <section className="glass-card-static rounded-3xl p-5 sm:p-6">
              <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-600">Advanced Filtering</p>
                  <h2 className="mt-1 text-2xl font-black text-zinc-950">Monitoring Prestasi</h2>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" onClick={() => setFilters(defaultFilters)}>
                    <Filter className="mr-2 h-4 w-4" />
                    Reset Filter
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => downloadAccreditationExcel(filters)}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Excel
                  </Button>
                </div>
              </div>

              <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="filter-nim">NIM</Label>
                  <Input
                    id="filter-nim"
                    value={filters.nim ?? ""}
                    onChange={(event) => setFilters((current) => ({ ...current, nim: event.target.value }))}
                    placeholder="2021015..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-nama">Nama</Label>
                  <Input
                    id="filter-nama"
                    value={filters.nama ?? ""}
                    onChange={(event) => setFilters((current) => ({ ...current, nama: event.target.value }))}
                    placeholder="Aisyah"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-angkatan">Angkatan</Label>
                  <Input
                    id="filter-angkatan"
                    type="number"
                    value={filters.angkatan ?? ""}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        angkatan: event.target.value ? Number(event.target.value) : undefined,
                      }))
                    }
                    placeholder="2021"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-tahun">Tahun kegiatan</Label>
                  <Input
                    id="filter-tahun"
                    type="number"
                    value={filters.tahun ?? ""}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        tahun: event.target.value ? Number(event.target.value) : undefined,
                      }))
                    }
                    placeholder="2024"
                  />
                </div>
              </div>

              <div className="mb-6 grid gap-3 md:grid-cols-3">
                <Select
                  value={filters.tingkat || "all"}
                  onValueChange={(value) =>
                    setFilters((current) => ({ ...current, tingkat: value === "all" ? "" : (value as TingkatPrestasi) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua tingkat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua tingkat</SelectItem>
                    <SelectItem value="LOKAL">Lokal</SelectItem>
                    <SelectItem value="NASIONAL">Nasional</SelectItem>
                    <SelectItem value="INTERNASIONAL">Internasional</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.kategori || "all"}
                  onValueChange={(value) => setFilters((current) => ({ ...current, kategori: value === "all" ? "" : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua kategori</SelectItem>
                    {categories.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.nama_kategori}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filters.jenis || "all"}
                  onValueChange={(value) =>
                    setFilters((current) => ({ ...current, jenis: value === "all" ? "" : (value as JenisPrestasi) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua jenis</SelectItem>
                    <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                    <SelectItem value="KELOMPOK">Kelompok</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-700">
                <Search className="h-4 w-4 text-red-600" />
                {filteredRows.length} data ditemukan
              </div>

              <AchievementTable rows={filteredRows} />
            </section>
          </TabsContent>

          <TabsContent value="kategori" className="space-y-5">
            <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="glass-card-static rounded-3xl p-5 sm:p-6">
                <p className="text-sm font-semibold text-red-600">Admin Prodi</p>
                <h2 className="mt-1 text-2xl font-black text-zinc-950">Tambah Kategori</h2>
                <form onSubmit={handleSubmitCategory} className="mt-6 grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kategori-baru">Nama kategori</Label>
                    <Input id="kategori-baru" name="nama_kategori" required placeholder="Inovasi Pembelajaran" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kategori-keterangan">Keterangan</Label>
                    <Textarea
                      id="kategori-keterangan"
                      name="keterangan"
                      required
                      placeholder="Kategori untuk lomba media, modul, dan perangkat ajar matematika."
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Menyimpan..." : "Simpan Kategori"}
                  </Button>
                </form>
              </div>

              <div className="glass-card-static rounded-3xl p-5 sm:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-amber-700">Referensi Input</p>
                    <h2 className="mt-1 text-2xl font-black text-zinc-950">Kategori Aktif</h2>
                  </div>
                  <Badge variant="secondary">{categories.filter((item) => item.is_active).length} aktif</Badge>
                </div>
                <div className="grid gap-3">
                  {categories.map((item, index) => (
                    <div key={item.id} className="rounded-2xl border border-white/35 bg-white/30 p-4 backdrop-blur-xl">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColors[index % categoryColors.length] }} />
                            <h3 className="font-bold text-zinc-950">{item.nama_kategori}</h3>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-zinc-600">{item.keterangan}</p>
                        </div>
                        <Badge variant={item.is_active ? "success" : "outline"}>{item.is_active ? "Aktif" : "Nonaktif"}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="pengguna" className="space-y-5">
            <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="grid gap-5">
                <div className="glass-card-static rounded-3xl p-5 sm:p-6">
                  <p className="text-sm font-semibold text-red-600">Admin Prodi</p>
                  <h2 className="mt-1 text-2xl font-black text-zinc-950">Tambah Mahasiswa</h2>
                  <form onSubmit={handleCreateStudent} className="mt-6 grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="user-nim">NIM</Label>
                        <Input id="user-nim" name="nim_nip" required placeholder="2024015001" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-angkatan">Angkatan</Label>
                        <Input id="user-angkatan" name="angkatan" type="number" placeholder="2024" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-name">Nama lengkap</Label>
                      <Input id="user-name" name="nama_lengkap" required placeholder="Nama Mahasiswa" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="user-email">Email</Label>
                        <Input id="user-email" name="email" type="email" required placeholder="mahasiswa@student.ac.id" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-phone">No. HP</Label>
                        <Input id="user-phone" name="no_hp" placeholder="081234567890" />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="user-prodi">Program studi</Label>
                        <Input id="user-prodi" name="program_studi" defaultValue="Pendidikan Matematika" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-password">Password awal</Label>
                        <Input id="user-password" name="password" type="password" minLength={8} required placeholder="Minimal 8 karakter" />
                      </div>
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Menyimpan..." : "Tambah Mahasiswa"}
                    </Button>
                  </form>
                </div>

                <div className="glass-card-static rounded-3xl p-5 sm:p-6">
                  <p className="text-sm font-semibold text-amber-700">Keamanan Akun</p>
                  <h2 className="mt-1 text-2xl font-black text-zinc-950">Reset Password Pengguna</h2>
                  <form onSubmit={handleResetUserPassword} className="mt-6 grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-user">Pengguna</Label>
                      <select
                        id="reset-user"
                        name="user_id"
                        required
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="">Pilih pengguna</option>
                        {users.filter((item) => item.id !== sessionUser.id).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.nama_lengkap} - {item.nim_nip} ({item.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reset-password">Password baru</Label>
                      <Input id="reset-password" name="password" type="password" minLength={8} required placeholder="Minimal 8 karakter" />
                    </div>
                    <Button type="submit" variant="secondary" disabled={isSubmitting}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Memproses..." : "Reset Password"}
                    </Button>
                  </form>
                </div>
              </div>

              <div className="glass-card-static rounded-3xl p-5 sm:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-red-600">Direktori Akun</p>
                    <h2 className="mt-1 text-2xl font-black text-zinc-950">Manajemen Pengguna</h2>
                  </div>
                  <Badge variant="secondary">{users.length} akun</Badge>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>NIM/NIP</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Angkatan</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-semibold text-zinc-900">{item.nama_lengkap}</TableCell>
                          <TableCell>{item.nim_nip}</TableCell>
                          <TableCell>
                            <Badge variant={item.role === "ADMIN" ? "destructive" : item.role === "DOSEN" ? "warning" : "secondary"}>
                              {item.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.angkatan ?? "-"}</TableCell>
                          <TableCell>{item.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="password" className="space-y-5">
            <section className="glass-card-static max-w-2xl rounded-3xl p-5 sm:p-6">
              <p className="text-sm font-semibold text-red-600">Keamanan Admin</p>
              <h2 className="mt-1 text-2xl font-black text-zinc-950">Ganti Password</h2>
              <form onSubmit={handleChangePassword} className="mt-6 grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Password lama</Label>
                  <Input id="current-password" name="current_password" type="password" required autoComplete="current-password" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Password baru</Label>
                    <Input id="new-password" name="new_password" type="password" minLength={8} required autoComplete="new-password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Konfirmasi password</Label>
                    <Input id="confirm-password" name="confirm_password" type="password" minLength={8} required autoComplete="new-password" />
                  </div>
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Menyimpan..." : "Simpan Password Baru"}
                </Button>
              </form>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function PrintAchievementReport({ rows, student }: { rows: AchievementWithDetails[]; student: User }) {
  const activeRows = rows.filter((row) => row.status_riwayat === "TERCATAT");
  const highestLevel =
    activeRows.find((row) => row.tingkat_prestasi === "INTERNASIONAL")?.tingkat_prestasi ??
    activeRows.find((row) => row.tingkat_prestasi === "NASIONAL")?.tingkat_prestasi ??
    activeRows[0]?.tingkat_prestasi ??
    "-";
  const printDate = getPrintDate();

  return (
    <section className="print-report" aria-label="Rekap prestasi mahasiswa">
      <header className="print-letterhead">
        <div className="print-logo">PM</div>
        <div>
          <p className="print-ministry">Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi</p>
          <h1>Jurusan Pendidikan Matematika</h1>
          <p>Program Studi Pendidikan Matematika</p>
          <p>Rekapitulasi data prestasi mahasiswa</p>
        </div>
      </header>

      <div className="print-rule" />

      <div className="print-title">
        <h2>Kartu Rekap Prestasi Mahasiswa</h2>
        <p>Nomor: RPM/{student.nim_nip}/{new Date().getFullYear()}</p>
      </div>

      <section className="print-identity">
        <div>
          <span>Nama Mahasiswa</span>
          <strong>{student.nama_lengkap}</strong>
        </div>
        <div>
          <span>NIM</span>
          <strong>{student.nim_nip}</strong>
        </div>
        <div>
          <span>Program Studi</span>
          <strong>{student.program_studi}</strong>
        </div>
        <div>
          <span>Angkatan</span>
          <strong>{student.angkatan ?? "-"}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>{student.email}</strong>
        </div>
        <div>
          <span>No. HP</span>
          <strong>{student.no_hp}</strong>
        </div>
      </section>

      <section className="print-summary">
        <div>
          <span>Total Prestasi</span>
          <strong>{rows.length}</strong>
        </div>
        <div>
          <span>Prestasi Tercatat</span>
          <strong>{activeRows.length}</strong>
        </div>
        <div>
          <span>Tingkat Tertinggi</span>
          <strong>{highestLevel}</strong>
        </div>
      </section>

      <section>
        <h3 className="print-section-title">Rekapitulasi Prestasi</h3>
        <table className="print-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Nama Kegiatan</th>
              <th>Kategori</th>
              <th>Jenis</th>
              <th>Tingkat</th>
              <th>Peringkat</th>
              <th>Penyelenggara</th>
              <th>Tanggal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td>{row.nama_kegiatan}</td>
                  <td>{row.category.nama_kategori}</td>
                  <td>{row.jenis_prestasi}</td>
                  <td>{row.tingkat_prestasi}</td>
                  <td>{row.juara_peringkat}</td>
                  <td>{row.penyelenggara}</td>
                  <td>{formatDateShort(row.tanggal_kegiatan)}</td>
                  <td>{row.status_riwayat}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9}>Belum ada data prestasi yang tercatat.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <footer className="print-footer">
        <div>
          <p>Dicetak pada: {printDate}</p>
          <p>Dokumen ini dihasilkan oleh Sistem Pendataan Prestasi Mahasiswa.</p>
        </div>
        <div className="print-signature">
          <p>Mengetahui,</p>
          <p>Ketua Jurusan Pendidikan Matematika</p>
          <div />
          <strong>(........................................)</strong>
        </div>
      </footer>
    </section>
  );
}

function AchievementTable({ rows, compact = false }: { rows: AchievementWithDetails[]; compact?: boolean }) {
  if (!rows.length) {
    return (
      <div className="flex min-h-60 flex-col items-center justify-center rounded-3xl border border-dashed border-white/50 bg-white/20 p-8 text-center backdrop-blur-xl">
        <FileBadge2 className="mb-4 h-10 w-10 text-red-500" />
        <p className="font-bold text-zinc-950">Belum ada data prestasi</p>
        <p className="mt-1 max-w-sm text-sm leading-6 text-zinc-600">Data yang tersimpan akan tampil di tabel rekap.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {!compact ? <TableHead>Mahasiswa</TableHead> : null}
          <TableHead>Kegiatan</TableHead>
          <TableHead>Kategori</TableHead>
          <TableHead>Tingkat</TableHead>
          <TableHead>Peringkat</TableHead>
          {!compact ? <TableHead>Tanggal</TableHead> : null}
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            {!compact ? (
              <TableCell className="min-w-52">
                <div className="font-bold text-zinc-950">{row.user.nama_lengkap}</div>
                <div className="text-xs font-medium text-zinc-500">
                  {row.user.nim_nip}
                  {row.user.angkatan ? ` · ${row.user.angkatan}` : ""}
                </div>
              </TableCell>
            ) : null}
            <TableCell className="min-w-60">
              <div className="font-bold text-zinc-950">{row.nama_kegiatan}</div>
              <div className="text-xs font-medium text-zinc-500">{row.penyelenggara}</div>
            </TableCell>
            <TableCell>{row.category.nama_kategori}</TableCell>
            <TableCell>
              <Badge variant={levelVariant(row.tingkat_prestasi)}>{row.tingkat_prestasi}</Badge>
            </TableCell>
            <TableCell className="font-semibold">{row.juara_peringkat}</TableCell>
            {!compact ? <TableCell>{formatDateShort(row.tanggal_kegiatan)}</TableCell> : null}
            <TableCell>
              <Badge variant={row.status_riwayat === "TERCATAT" ? "success" : "outline"}>{row.status_riwayat}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ChartCard({
  title,
  eyebrow,
  data,
  xKey,
  yKey,
}: {
  title: string;
  eyebrow: string;
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
}) {
  return (
    <div className="glass-card-static rounded-3xl p-5 sm:p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold text-red-600">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-black text-zinc-950">{title}</h2>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -16, right: 12, top: 12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(113,113,122,0.18)" />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.5)" }} />
            <Bar dataKey={yKey} radius={[10, 10, 0, 0]} fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
