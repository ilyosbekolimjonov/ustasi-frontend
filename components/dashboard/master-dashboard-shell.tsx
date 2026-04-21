"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  clearAuthSession,
  getRoleDashboardPath,
  isMasterDashboardRole,
  readAuthSession,
  type AuthSession,
} from "@/lib/auth-storage";

import { LoadingState } from "./dashboard-ui";

const NAV_ITEMS = [
  { href: "/dashboard/master/home", label: "Dashboard Home", caption: "Usta paneli" },
  { href: "/dashboard/master/requests", label: "Requests", caption: "Ochiq so'rovlar" },
  { href: "/dashboard/master/chats", label: "Chats", caption: "Muloqotlar" },
  { href: "/dashboard/master/profile", label: "Profile", caption: "Usta profili" },
  { href: "/dashboard/master/basket", label: "Basket", caption: "Savat" },
  { href: "/dashboard/master/orders", label: "Orders", caption: "Buyurtmalar" },
  { href: "/dashboard/master/products", label: "Products", caption: "Mahsulotlar" },
];

type MasterDashboardShellProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  children: (session: AuthSession) => ReactNode;
};

export function MasterDashboardShell({
  title,
  description,
  actions,
  children,
}: MasterDashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null | undefined>(undefined);

  useEffect(() => {
    const nextSession = readAuthSession();

    if (!nextSession) {
      router.replace("/login");
      return;
    }

    if (!isMasterDashboardRole(nextSession.user.role)) {
      router.replace(getRoleDashboardPath(nextSession.user.role));
      return;
    }

    setSession(nextSession);
  }, [router]);

  const activeLabel = useMemo(
    () => NAV_ITEMS.find((item) => pathname?.startsWith(item.href))?.caption ?? "Usta paneli",
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
          <LoadingState label="Usta paneli tayyorlanmoqda..." />
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell min-h-screen px-4 py-6 sm:px-6 xl:px-8">
      <div className="mx-auto grid w-full max-w-[1320px] content-start items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="section-card flex self-start rounded-[2rem] p-5 xl:sticky xl:top-6 xl:min-h-[calc(100vh-3rem)] xl:flex-col">
          <div className="rounded-[1.25rem] bg-[rgba(255,250,242,0.86)] px-3 py-3">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--amber-deep)]">
              Master Dashboard
            </p>
            <h2 className="mt-2 truncate text-lg font-bold text-[var(--navy)]">{session.user.fullName}</h2>
            <p className="mt-1 truncate text-xs text-[var(--muted)]">{session.user.phone || session.user.email}</p>
            <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--teal)]">
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
                  className={`group rounded-[1.2rem] border px-4 py-3 transition ${
                    active
                      ? "border-[rgba(23,32,51,0.08)] bg-[var(--navy)] text-white shadow-lg"
                      : "border-transparent bg-white/60 text-[var(--navy)] hover:border-[var(--border)] hover:bg-white"
                  }`}
                >
                  <div className={`text-sm font-extrabold ${active ? "text-white" : "text-[var(--navy)]"}`}>
                    {item.label}
                  </div>
                  <div
                    className={`mt-1 text-xs font-semibold ${
                      active
                        ? "text-white/85"
                        : "text-[var(--navy-soft)] group-hover:text-[var(--navy)]"
                    }`}
                  >
                    {item.caption}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-5 grid gap-2 xl:mt-auto xl:pt-5">
            <button type="button" className="button-primary w-full cursor-pointer text-sm" onClick={handleLogout}>
              Chiqish
            </button>
          </div>
        </aside>

        <div className="grid min-w-0 content-start items-start gap-6">
          <header className="section-card rounded-[2rem] px-6 py-6 sm:px-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <span className="eyebrow">Master Panel</span>
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
