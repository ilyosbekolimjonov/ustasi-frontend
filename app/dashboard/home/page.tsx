"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DashboardCard, EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/dashboard/dashboard-ui";
import { UserDashboardShell } from "@/components/dashboard/user-dashboard-shell";
import { getUserDashboardSummary, type DashboardSummary } from "@/lib/dashboard-api";
import type { AuthSession } from "@/lib/auth-storage";
import { formatDate, formatRequestBudget } from "@/lib/format";

export default function DashboardHomePage() {
  return (
    <UserDashboardShell
      title="Dashboard Home"
      description="Profilingiz, so'nggi so'rovlaringiz va tavsiya etilgan ustalarni bir joyda ko'ring."
    >
      {(session) => <DashboardHomeContent session={session} />}
    </UserDashboardShell>
  );
}

function DashboardHomeContent({ session }: { session: AuthSession }) {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const summary = await getUserDashboardSummary(session.accessToken);

        if (!cancelled) {
          setData(summary);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Dashboard yuklanmadi.");
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
    return <LoadingState label="Dashboard ma'lumotlari yuklanmoqda..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!data) {
    return <EmptyState title="Ma'lumot topilmadi" description="Dashboard ma'lumotlari hozircha mavjud emas." />;
  }

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="grid gap-5">
        <DashboardCard>
          <span className="eyebrow">Profil</span>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            {data.profile.avatarUrl ? (
              <img
                src={data.profile.avatarUrl}
                alt={data.profile.fullName}
                className="h-20 w-20 rounded-[1.5rem] object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-[rgba(23,32,51,0.08)] text-2xl font-bold text-[var(--navy)]">
                {data.profile.fullName.slice(0, 1)}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-[var(--navy)]">{data.profile.fullName}</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">{data.profile.phone}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{data.profile.email}</p>
              <p className="mt-3 text-sm text-[var(--navy-soft)]">
                {data.profile.address || "Manzil hali kiritilmagan"}
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-[var(--navy)]">So'nggi so'rovlar</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">Oxirgi 5 ta xizmat so'rovi</p>
            </div>
            <Link href="/dashboard/requests" className="button-secondary text-sm">
              Barchasi
            </Link>
          </div>

          {data.latestRequests.length ? (
            <div className="mt-5 grid gap-3">
              {data.latestRequests.map((request) => (
                <div key={request.id} className="rounded-[1.3rem] border border-[var(--border)] bg-[rgba(255,250,242,0.72)] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-[var(--navy)]">{request.title}</h4>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {request.category} - {request.city}
                      </p>
                      <p className="mt-2 text-sm font-medium text-[var(--navy-soft)]">
                        {formatRequestBudget(request.budgetMin, request.budgetMax)}
                      </p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>

                  {request.images.length ? (
                    <div className="mt-3 flex gap-3">
                      {request.images.slice(0, 2).map((imageUrl) => (
                        <img key={imageUrl} src={imageUrl} alt="" className="h-20 w-20 rounded-[1rem] object-cover" />
                      ))}
                    </div>
                  ) : null}

                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                    {formatDate(request.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                title="Hali so'rov yo'q"
                description="Birinchi xizmat so'rovingizni yaratib, ustalardan taklif oling."
                action={
                  <Link href="/dashboard/requests" className="button-primary text-sm">
                    So'rov yaratish
                  </Link>
                }
              />
            </div>
          )}
        </DashboardCard>
      </div>

      <div className="grid gap-5">
        <DashboardCard>
          <span className="eyebrow">Qisqa Holat</span>
          <div className="mt-4 grid gap-3">
            <SummaryItem label="Jami so'rovlar" value={String(data.requestCounts?.total ?? data.latestRequests.length)} />
            <SummaryItem label="Ochiq so'rovlar" value={String(data.requestCounts?.open ?? 0)} />
            <SummaryItem label="Yakunlangan" value={String(data.requestCounts?.completed ?? 0)} />
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-[var(--navy)]">Tavsiya etilgan ustalar</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">Faol va yuqori baholangan ustalar</p>
            </div>
            <Link href="/dashboard/masters" className="button-secondary text-sm">
              Ko'rish
            </Link>
          </div>

          {data.suggestedMasters.length ? (
            <div className="mt-5 grid gap-3">
              {data.suggestedMasters.map((master) => (
                <div key={master.id} className="rounded-[1.3rem] border border-[var(--border)] bg-white/72 p-4">
                  <div className="flex gap-4">
                    <img
                      src={master.profileImageUrl || master.avatarUrl || "/icon.png"}
                      alt={master.fullName}
                      className="h-16 w-16 rounded-[1.2rem] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-bold text-[var(--navy)]">{master.fullName}</h4>
                        {master.isAvailable ? <StatusBadge status="ACTIVE" /> : null}
                      </div>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {master.category} - {master.city}
                      </p>
                      <p className="mt-2 text-sm text-[var(--navy-soft)]">
                        Reyting: {master.ratingAverage.toFixed(1)} - Yakunlangan ishlar: {master.jobsCompletedCount}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{master.experienceText}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                title="Mos usta topilmadi"
                description="Hozircha tavsiya ko'rsatish uchun yetarli ma'lumot yo'q."
              />
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] border border-[var(--border)] bg-white/72 px-4 py-4">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[var(--navy)]">{value}</p>
    </div>
  );
}
