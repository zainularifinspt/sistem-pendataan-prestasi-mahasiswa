"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  LogOut, 
  ShieldCheck, 
  Sparkles, 
  User, 
  KeyRound, 
  Info, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [identityInput, setIdentityInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoCreds, setShowDemoCreds] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setLoginError("");

    const result = await authClient.signIn.username({
      username: identityInput.trim(),
      password: passwordInput,
      rememberMe: true,
    });

    if (result.error) {
      setLoginError(result.error.message ?? "NIM atau password belum sesuai.");
      setIsSubmitting(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <main className="login-hero-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="math-mark left-[8%] top-[18%] text-4xl">x²</span>
        <span className="math-mark left-[18%] bottom-[24%] text-5xl">sin</span>
        <span className="math-mark left-[34%] top-[12%] text-6xl">∆</span>
        <span className="math-mark right-[30%] top-[18%] text-5xl">π</span>
        <span className="math-mark right-[9%] top-[34%] text-4xl">x²</span>
        <span className="math-mark right-[17%] bottom-[23%] text-4xl">sin</span>
        <span className="math-mark bottom-[8%] left-[46%] text-4xl">θ</span>
        <span className="math-mark bottom-[12%] right-[21%] text-4xl">a²+b²=c²</span>
        <span className="math-mark left-[49%] top-[31%] text-5xl">×</span>
        <span className="math-mark right-[39%] bottom-[36%] text-5xl">∑</span>
      </div>

      <section className="relative z-10 mx-auto grid w-full max-w-6xl items-stretch gap-12 py-4 lg:grid-cols-[1.05fr_0.95fr]">
        
        {/* Left Column: Department Identity & Branding */}
        <div className="flex h-full flex-col justify-between gap-8 text-left lg:pr-8">
          
          <div className="flex w-full max-w-xl flex-col items-start gap-4 rounded-3xl border border-white/30 bg-white/15 p-4 shadow-2xl shadow-red-950/10 backdrop-blur-md sm:flex-row sm:items-center">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 shadow-md border border-white/60">
              <img src="/logo-ulm.png" alt="Logo ULM" className="h-16 w-16 object-contain" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                Jurusan Pendidikan Matematika
              </h3>
              <p className="text-xs font-black tracking-[0.12em] text-amber-100 uppercase">
                Universitas Lambung Mangkurat
              </p>
            </div>
          </div>

          <div className="space-y-4 pb-2 lg:pb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/15 px-4 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              Portal SIPRESMA
            </div>
            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1] drop-shadow-[0_10px_24px_rgba(120,20,0,0.22)]">
              Sistem Pendataan <br />
              <span className="text-amber-100">
                Prestasi Mahasiswa
              </span>
            </h1>
            <p className="max-w-xl text-base sm:text-lg leading-relaxed text-white/80">
              Platform terintegrasi untuk mencatat prestasi, memantau statistik mahasiswa, dan menyusun rekapitulasi pelaporan akreditasi program studi secara praktis dan transparan.
            </p>
          </div>
        </div>

        {/* Right Column: Glassmorphic Login Form */}
        <div className="relative w-full max-w-md mx-auto lg:max-w-none">
          <form
            onSubmit={handleLogin}
            className="glass-card-premium relative overflow-hidden rounded-[2.5rem] border border-white/55 p-6 sm:p-10"
          >
            <div className="relative mb-8 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-red-700 shadow-sm backdrop-blur-xl">
                <ShieldCheck className="h-3.5 w-3.5" />
                Gerbang Masuk
              </div>
              <div className="space-y-1">
                <h2 className="text-balance text-2xl sm:text-3xl font-extrabold text-zinc-950">
                  Masuk Akun
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-600">
                  Masukkan NIM/NIP beserta sandi resmi Anda.
                </p>
              </div>
            </div>

            <div className="relative space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="identity" className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  NIM / NIP
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-zinc-400 pointer-events-none">
                    <User className="h-5 w-5" />
                  </span>
                  <Input
                    id="identity"
                    value={identityInput}
                    onChange={(event) => {
                      setIdentityInput(event.target.value);
                      setLoginError("");
                    }}
                    placeholder="Masukkan NIM atau NIP"
                    className="h-14 pl-12 rounded-2xl bg-white/55 text-base font-semibold shadow-inner border-white/60 focus:bg-white/85 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="password" className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Sandi
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-zinc-400 pointer-events-none">
                    <KeyRound className="h-5 w-5" />
                  </span>
                  <Input
                    id="password"
                    type="password"
                    value={passwordInput}
                    onChange={(event) => {
                      setPasswordInput(event.target.value);
                      setLoginError("");
                    }}
                    placeholder="Masukkan sandi akun"
                    className="h-14 pl-12 rounded-2xl bg-white/55 text-base font-semibold shadow-inner border-white/60 focus:bg-white/85 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {loginError ? (
                <div className="rounded-2xl border border-red-200/50 bg-red-50/70 px-4 py-3 text-xs sm:text-sm font-semibold text-red-700 backdrop-blur-md animate-pulse">
                  {loginError}
                </div>
              ) : null}
            </div>

            <Button 
              type="submit" 
              className="relative mt-8 h-14 w-full rounded-2xl text-base font-extrabold bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white shadow-lg shadow-red-600/10 active:scale-[0.98] transition-all duration-200" 
              size="lg" 
              disabled={isSubmitting}
            >
              <LogOut className="mr-2 h-5 w-5 rotate-180" />
              {isSubmitting ? "Mengautentikasi..." : "Masuk ke Dashboard"}
            </Button>

            {/* Collapsible Demo Accounts Helper inside the Glass Card */}
            <div className="mt-6 border-t border-zinc-200/50 pt-4 text-left">
              <button
                type="button"
                onClick={() => setShowDemoCreds(!showDemoCreds)}
                className="flex w-full items-center justify-between text-xs font-bold text-zinc-500 hover:text-zinc-800 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-amber-500" />
                  Bantuan Akun Demo / Uji Coba
                </span>
                {showDemoCreds ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showDemoCreds && (
                <div className="mt-3 space-y-2 rounded-2xl bg-white/40 p-3 border border-white/50 backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-200">
                  <p className="text-[10px] text-zinc-500 font-bold">
                    Klik nama akun berikut untuk langsung mengisi form:
                  </p>
                  <div className="grid gap-1.5">
                    {[
                      { label: "Aisyah (Mahasiswa)", nim: "2021015001" },
                      { label: "Dr. Budi (Dosen)", nim: "198505152010121002" },
                      { label: "Ratna Sari (Admin)", nim: "199001012015032001" },
                    ].map((account) => (
                      <button
                        key={account.nim}
                        type="button"
                        onClick={() => {
                          setIdentityInput(account.nim);
                          setPasswordInput("prestasi-demo");
                          setLoginError("");
                        }}
                        className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2 text-left text-xs font-semibold text-zinc-700 hover:bg-white/95 border border-white/40 hover:border-amber-300 transition-all shadow-sm"
                      >
                        <span>{account.label}</span>
                        <span className="text-[10px] text-amber-800 font-extrabold font-mono bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {account.nim}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="text-[9px] text-zinc-500 leading-tight text-center mt-1">
                    Sandi semua akun demo: <code className="font-bold text-amber-800 bg-amber-50/50 px-1 py-0.5 rounded border border-amber-100/50">prestasi-demo</code>
                  </div>
                </div>
              )}
            </div>

          </form>
        </div>

      </section>
    </main>
  );
}
