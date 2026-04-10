"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  clearAuthSession,
  getRoleDashboardPath,
  isUserDashboardRole,
  readAuthSession,
  type AuthSession,
} from "@/lib/auth-storage";

import { LoadingState } from "./dashboard-ui";

const NAV_ITEMS = [
  { href: "/dashboard/home", label: "Dashboard Home", caption: "Asosiy ko'rinish" },
  { href: "/dashboard/requests", label: "My Requests", caption: "So'rovlarim" },
  { href: "/dashboard/masters", label: "Masters", caption: "Ustalar" },
  { href: "/dashboard/profile", label: "Profile", caption: "Profil" },
  { href: "/dashboard/basket", label: "Basket", caption: "Savat" },
  { href: "/dashboard/orders", label: "Orders", caption: "Buyurtmalar" },
  { href: "/dashboard/products", label: "Products", caption: "Mahsulotlar" },
];

type UserDashboardShellProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  children: (session: AuthSession) => ReactNode;
};

export function UserDashboardShell({
  title,
  description,
  actions,
  children,
}: UserDashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null | undefined>(undefined);

  useEffect(() => {
    const nextSession = readAuthSession();

    if (!nextSession) {
      router.replace("/login");
      return;
    }

    if (!isUserDashboardRole(nextSession.user.role)) {
      router.replace(getRoleDashboardPath(nextSession.user.role));
      return;
    }

    setSession(nextSession);
  }, [router]);

  const activeLabel = useMemo(
    () => NAV_ITEMS.find((item) => pathname?.startsWith(item.href))?.caption ?? "Dashboard",
    [pathname],
  );

  function handleLogout() {
    clearAuthSession();

    startTransition(() => {
      router.replace("/login");
    });
  }

  if (!session) {
    return (
      <main className="page-shell min-h-screen px-4 py-6 sm:px-6 xl:px-8">
        <div className="mx-auto w-full max-w-[1320px]">
          <LoadingState label="Dashboard tayyorlanmoqda..." />
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell min-h-screen px-4 py-6 sm:px-6 xl:px-8">
      <div className="mx-auto grid w-full max-w-[1320px] items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="section-card rounded-[2rem] p-5 xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)]">
          <div className="rounded-[1.5rem] bg-[rgba(255,250,242,0.86)] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--amber-deep)]">
              Ustasi Dashboard
            </p>
            <h2 className="mt-3 text-2xl font-bold text-[var(--navy)]">{session.user.fullName}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{session.user.phone || session.user.email}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--teal)]">
              {activeLabel}
            </p>
          </div>

          <nav className="mt-5 grid gap-2">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-[1.2rem] border px-4 py-3 transition ${
                    active
                      ? "border-[rgba(23,32,51,0.08)] bg-[var(--navy)] text-white shadow-lg"
                      : "border-transparent bg-white/60 text-[var(--navy)] hover:border-[var(--border)] hover:bg-white"
                  }`}
                >
                  <div className="text-sm font-bold">{item.label}</div>
                  <div className={`mt-1 text-xs ${active ? "text-white/70" : "text-[var(--muted)]"}`}>
                    {item.caption}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-5 grid gap-2">
            <Link href="/" className="button-secondary w-full text-sm">
              Bosh sahifa
            </Link>
            <button type="button" className="button-primary w-full cursor-pointer text-sm" onClick={handleLogout}>
              Chiqish
            </button>
          </div>
        </aside>

        <div className="grid min-w-0 gap-6">
          <header className="section-card rounded-[2rem] px-6 py-6 sm:px-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <span className="eyebrow">User Panel</span>
                <h1 className="section-title mt-4 text-4xl text-[var(--navy)] sm:text-5xl">
                  {title}
                </h1>
                <p className="muted-text mt-3 max-w-3xl text-base leading-8">{description}</p>
              </div>
              {actions ? <div className="shrink-0">{actions}</div> : null}
            </div>
          </header>

          {children(session)}
        </div>
      </div>
    </main>
  );
}
