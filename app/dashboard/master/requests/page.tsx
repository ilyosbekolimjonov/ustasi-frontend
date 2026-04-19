"use client";

import { useEffect, useState } from "react";

import { DashboardCard, EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/dashboard/dashboard-ui";
import { MasterDashboardShell } from "@/components/dashboard/master-dashboard-shell";
import type { AuthSession } from "@/lib/auth-storage";
import {
  claimServiceRequest,
  listClaimedServiceRequests,
  listOpenServiceRequests,
  listRegions,
  type Region,
  type ServiceRequest,
} from "@/lib/dashboard-api";
import { formatDateTime, formatRequestBudget } from "@/lib/format";

export default function MasterRequestsPage() {
  return (
    <MasterDashboardShell
      title="Requests"
      description="Mijozlar yuborgan ochiq so'rovlarni ko'ring va mos ishni qabul qiling."
    >
      {(session) => <MasterRequestsContent session={session} />}
    </MasterDashboardShell>
  );
}

function MasterRequestsContent({ session }: { session: AuthSession }) {
  const [openRequests, setOpenRequests] = useState<ServiceRequest[]>([]);
  const [claimedRequests, setClaimedRequests] = useState<ServiceRequest[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState("");

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");
      const [openResponse, claimedResponse] = await Promise.all([
        listOpenServiceRequests(session.accessToken, {
          limit: 20,
          city: city || undefined,
          search: search || undefined,
        }),
        listClaimedServiceRequests(session.accessToken, { limit: 10 }),
      ]);

      setOpenRequests(openResponse.items);
      setClaimedRequests(claimedResponse.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "So'rovlar yuklanmadi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadRegions() {
      try {
        const regionItems = await listRegions({ limit: 100 });
        if (!cancelled) {
          setRegions(regionItems);
        }
      } catch {
        if (!cancelled) {
          setRegions([]);
        }
      }
    }

    void loadRegions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.accessToken]);

  async function handleClaim(requestId: string) {
    try {
      setBusyId(requestId);
      setError("");
      setSuccess("");
      await claimServiceRequest(session.accessToken, requestId);
      setSuccess("So'rov qabul qilindi. Mijoz bilan bog'lanish uchun tafsilotlarni tekshiring.");
      await loadRequests();
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : "So'rov qabul qilinmadi.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.06fr)_minmax(360px,0.94fr)]">
      <DashboardCard className="min-w-0">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <div className="grid gap-2">
            <label className="text-sm font-bold text-[var(--navy)]">Qidiruv</label>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="auth-input"
              placeholder="Sarlavha, tavsif yoki kategoriya"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-bold text-[var(--navy)]">Viloyat</label>
            <select value={city} onChange={(event) => setCity(event.target.value)} className="auth-input">
              <option value="">Barcha viloyatlar</option>
              {regions.map((region) => (
                <option key={region.id} value={region.nameUz}>
                  {region.nameUz}
                </option>
              ))}
            </select>
          </div>

          <button type="button" className="button-primary self-end cursor-pointer text-sm" onClick={() => void loadRequests()}>
            Filtrlash
          </button>
        </div>

        {error ? <div className="mt-4"><ErrorState message={error} /></div> : null}
        {success ? (
          <div className="mt-4 rounded-[1.2rem] border border-[rgba(45,143,139,0.22)] bg-[rgba(237,250,248,0.92)] px-4 py-3 text-sm text-[var(--teal)]">
            {success}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-5">
            <LoadingState label="Ochiq so'rovlar yuklanmoqda..." />
          </div>
        ) : openRequests.length ? (
          <div className="mt-5 grid gap-4">
            {openRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                actionLabel={busyId === request.id ? "Qabul qilinmoqda..." : "So'rovni qabul qilish"}
                actionDisabled={!!busyId}
                onAction={() => void handleClaim(request.id)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState title="Ochiq so'rov topilmadi" description="Filtrlarni o'zgartirib ko'ring yoki keyinroq qayta kiring." />
          </div>
        )}
      </DashboardCard>

      <DashboardCard className="min-w-0">
        <h2 className="text-2xl font-bold text-[var(--navy)]">Qabul qilinganlar</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Siz olgan oxirgi so'rovlar.</p>

        {loading ? (
          <div className="mt-5">
            <LoadingState label="Ishlar yuklanmoqda..." />
          </div>
        ) : claimedRequests.length ? (
          <div className="mt-5 grid gap-3">
            {claimedRequests.map((request) => (
              <RequestCard key={request.id} request={request} compact />
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState title="Hali ish yo'q" description="Mos kelgan ochiq so'rovni qabul qilganingizda shu yerda ko'rinadi." />
          </div>
        )}
      </DashboardCard>
    </div>
  );
}

function RequestCard({
  request,
  compact,
  actionLabel,
  actionDisabled,
  onAction,
}: {
  request: ServiceRequest;
  compact?: boolean;
  actionLabel?: string;
  actionDisabled?: boolean;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-[1.4rem] border border-[var(--border)] bg-white/72 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--navy)]">{request.title}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {request.category} - {request.city}
          </p>
          <p className="mt-2 text-sm font-medium text-[var(--navy-soft)]">
            {formatRequestBudget(request.budgetMin, request.budgetMax)}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {!compact ? (
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--muted)]">{request.description}</p>
      ) : null}

      {request.images.length && !compact ? (
        <div className="mt-3 flex gap-3">
          {request.images.slice(0, 2).map((imageUrl) => (
            <img key={imageUrl} src={imageUrl} alt="" className="h-20 w-20 rounded-[1rem] object-cover" />
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
          {formatDateTime(request.createdAt)}
        </p>
        {onAction ? (
          <button
            type="button"
            className="button-primary cursor-pointer text-sm"
            disabled={actionDisabled}
            onClick={onAction}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
