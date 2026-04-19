"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DashboardCard, EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/dashboard/dashboard-ui";
import { MasterDashboardShell } from "@/components/dashboard/master-dashboard-shell";
import type { AuthSession } from "@/lib/auth-storage";
import { getMasterDashboardSummary, type MasterDashboardSummary } from "@/lib/dashboard-api";
import { formatDateTime } from "@/lib/format";

export default function MasterDashboardHomePage() {
  return (
    <MasterDashboardShell
      title="Dashboard Home"
      description="Ochiq so'rovlar, qabul qilingan ishlar va profilingiz holatini bir joyda kuzating."
    >
      {(session) => <MasterHomeContent session={session} />}
    </MasterDashboardShell>
  );
}

function MasterHomeContent({ session }: { session: AuthSession }) {
  const [data, setData] = useState<MasterDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const summary = await getMasterDashboardSummary(session.accessToken);
        if (!cancelled) {
          setData(summary);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Usta dashboard yuklanmadi.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [session.accessToken]);

  if (loading) {
    return <LoadingState label="Usta dashboard yuklanmoqda..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!data) {
    return <EmptyState title="Ma'lumot topilmadi" description="Usta paneli ma'lumotlari hozircha mavjud emas." />;
  }

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="grid gap-5">
        <DashboardCard>
          <span className="eyebrow">Profil</span>
          <h2 className="mt-4 text-2xl font-bold text-[var(--navy)]">{data.profile.fullName}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{data.profile.phone || data.profile.email}</p>
          <p className="mt-4 text-sm leading-7 text-[var(--navy-soft)]">
            Profilingizni to'liq va aniq saqlang. Mijozlar so'rovni qabul qilganingizdan keyin shu ma'lumotlarga tayanadi.
          </p>
          <Link href="/dashboard/master/profile" className="button-secondary mt-5 text-sm">
            Profilni tahrirlash
          </Link>
        </DashboardCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryCard label="Ochiq so'rovlar" value={data.openRequestCount} />
          <SummaryCard label="Qabul qilingan" value={data.claimedRequestCount} />
        </div>
      </div>

      <div className="grid gap-5">
        <DashboardCard>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-[var(--navy)]">Yangi so'rovlar</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">Siz qabul qilishingiz mumkin bo'lgan oxirgi so'rovlar.</p>
            </div>
            <Link href="/dashboard/master/requests" className="button-secondary text-sm">
              Ko'rish
            </Link>
          </div>

          {data.latestOpenRequests.length ? (
            <div className="mt-5 grid gap-3">
              {data.latestOpenRequests.map((request) => (
                <MiniRequest key={request.id} request={request} date={request.createdAt} />
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState title="Ochiq so'rov yo'q" description="Hozircha yangi xizmat so'rovlari topilmadi." />
            </div>
          )}
        </DashboardCard>

        <DashboardCard>
          <h3 className="text-xl font-bold text-[var(--navy)]">Qabul qilingan so'rovlar</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">Oxirgi yangilangan ishlaringiz.</p>

          {data.latestClaimedRequests.length ? (
            <div className="mt-5 grid gap-3">
              {data.latestClaimedRequests.map((request) => (
                <MiniRequest key={request.id} request={request} date={request.updatedAt} />
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState title="Hali ish qabul qilinmagan" description="Ochiq so'rovlar bo'limidan mos ishni tanlang." />
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <DashboardCard>
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-4xl font-bold text-[var(--navy)]">{value}</p>
    </DashboardCard>
  );
}

function MiniRequest({
  request,
  date,
}: {
  request: Pick<MasterDashboardSummary["latestOpenRequests"][number], "title" | "category" | "city" | "status">;
  date: string;
}) {
  return (
    <div className="rounded-[1.3rem] border border-[var(--border)] bg-white/72 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="text-lg font-bold text-[var(--navy)]">{request.title}</h4>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {request.category} - {request.city}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        {formatDateTime(date)}
      </p>
    </div>
  );
}
