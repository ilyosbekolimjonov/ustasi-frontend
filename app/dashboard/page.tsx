"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

import {
  clearAuthSession,
  getRoleDashboardPath,
  isUserDashboardRole,
  isMasterDashboardRole,
  readAuthSession,
  type AuthSession,
} from "@/lib/auth-storage";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null | undefined>(undefined);

  useEffect(() => {
    const currentSession = readAuthSession();

    if (!currentSession) {
      router.replace("/login");
      return;
    }

    if (isUserDashboardRole(currentSession.user.role)) {
      router.replace("/dashboard/home");
      return;
    }

    if (isMasterDashboardRole(currentSession.user.role)) {
      router.replace("/dashboard/master/home");
      return;
    }

    setSession(currentSession);
  }, [router]);

  if (!session) {
    return (
      <main className="page-shell min-h-screen px-3 py-5 sm:px-5">
        <div className="section-shell">
          <section className="section-card rounded-[2rem] px-6 py-8 text-center sm:px-10 sm:py-10">
            <span className="eyebrow">Dashboard</span>
            <h1 className="section-title mt-5 text-4xl text-[var(--navy)] sm:text-5xl">
              Dashboard tayyorlanmoqda
            </h1>
          </section>
        </div>
      </main>
    );
  }

  function handleLogout() {
    clearAuthSession();

    startTransition(() => {
      router.replace("/login");
    });
  }

  return (
    <main className="page-shell min-h-screen px-3 py-5 sm:px-5">
      <div className="section-shell">
        <section className="section-card rounded-[2rem] px-6 py-8 sm:px-10 sm:py-10">
          <span className="eyebrow">Dashboard</span>
          <h1 className="section-title mt-5 text-4xl text-[var(--navy)] sm:text-5xl">
            Hisobingizga xush kelibsiz
          </h1>
          <p className="muted-text mt-4 max-w-2xl text-base leading-8 sm:text-lg">
            Sizning rolingiz uchun alohida dashboard yo&apos;li saqlanib qoldi. Mijozlar
            paneli endi alohida sahifalarda ishlaydi, usta oqimi esa shu asosiy nuqtadan
            davom etadi.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="button-secondary">
              Bosh sahifa
            </Link>
            <button type="button" className="button-primary cursor-pointer" onClick={handleLogout}>
              Chiqish
            </button>
          </div>

          <p className="mt-6 text-sm text-[var(--muted)]">
            Joriy rol: <span className="font-bold text-[var(--navy)]">{session.user.role}</span>
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Agar bu hisob mijoz roli bo&apos;lsa, u avtomatik ravishda{" "}
            <span className="font-semibold text-[var(--navy)]">
              {getRoleDashboardPath(session.user.role)}
            </span>{" "}
            ga yo&apos;naltiriladi.
          </p>
        </section>
      </div>
    </main>
  );
}
