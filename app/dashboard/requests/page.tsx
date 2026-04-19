"use client";

import { useEffect, useState } from "react";

import { DashboardCard, EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/dashboard/dashboard-ui";
import { ServiceRequestForm } from "@/components/dashboard/service-request-form";
import { UserDashboardShell } from "@/components/dashboard/user-dashboard-shell";
import {
  cancelServiceRequest,
  createServiceRequest,
  getServiceRequest,
  listRegions,
  listMyServiceRequests,
  updateServiceRequest,
  type Region,
  type ServiceRequest,
  type ServiceRequestPayload,
} from "@/lib/dashboard-api";
import type { AuthSession } from "@/lib/auth-storage";
import { formatDateTime, formatRequestBudget } from "@/lib/format";

export default function RequestsPage() {
  return (
    <UserDashboardShell
      title="My Requests"
      description="Xizmat so'rovlaringizni yarating, ko'ring, tahrirlang va kerak bo'lsa bekor qiling."
    >
      {(session) => <RequestsContent session={session} />}
    </UserDashboardShell>
  );
}

function RequestsContent({ session }: { session: AuthSession }) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [regions, setRegions] = useState<Region[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");

  async function loadRequests(nextSelectedId?: string) {
    try {
      setLoading(true);
      setError("");
      const response = await listMyServiceRequests(session.accessToken, { limit: 20 });
      setRequests(response.items);

      if (nextSelectedId) {
        const detailed = await getServiceRequest(session.accessToken, nextSelectedId);
        setSelectedRequest(detailed);
        setMode("edit");
        return;
      }

      if (selectedRequest) {
        const current = response.items.find((item) => item.id === selectedRequest.id);
        setSelectedRequest(current ?? null);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "So'rovlar yuklanmadi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.accessToken]);

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

  async function handleCreate(payload: ServiceRequestPayload) {
    setSubmitting(true);

    try {
      const created = await createServiceRequest(session.accessToken, payload);
      setMode("edit");
      setSuccessMessage("So'rov muvaffaqiyatli yaratildi va ro'yxat yangilandi.");
      await loadRequests(created.id);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(payload: ServiceRequestPayload) {
    if (!selectedRequest) {
      return;
    }

    setSubmitting(true);

    try {
      const updated = await updateServiceRequest(session.accessToken, selectedRequest.id, payload);
      setSuccessMessage("So'rov o'zgarishlari saqlandi.");
      await loadRequests(updated.id);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(requestId: string) {
    try {
      await cancelServiceRequest(session.accessToken, requestId);
      setSuccessMessage("So'rov bekor qilindi.");
      await loadRequests(requestId);
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "So'rov bekor qilinmadi.");
    }
  }

  async function handleSelect(requestId: string) {
    try {
      setError("");
      const detailed = await getServiceRequest(session.accessToken, requestId);
      setSelectedRequest(detailed);
      setMode("edit");
    } catch (selectError) {
      setError(selectError instanceof Error ? selectError.message : "So'rov tafsiloti yuklanmadi.");
    }
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.96fr)_minmax(420px,1.04fr)]">
      <DashboardCard className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--navy)]">So'rovlar ro'yxati</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Yaratilgan xizmat so'rovlaringiz, holati va biriktirilgan rasmlari shu yerda ko'rinadi.
            </p>
          </div>
          <button
            type="button"
            className="button-primary cursor-pointer text-sm"
            onClick={() => {
              setSuccessMessage("");
              setMode("create");
              setSelectedRequest(null);
            }}
          >
            Yangi so'rov
          </button>
        </div>

        {error ? <div className="mt-4"><ErrorState message={error} /></div> : null}

        {loading ? (
          <div className="mt-5">
            <LoadingState label="So'rovlar yuklanmoqda..." />
          </div>
        ) : requests.length ? (
          <div className="mt-5 grid gap-3">
            {requests.map((request) => (
              <button
                key={request.id}
                type="button"
                onClick={() => void handleSelect(request.id)}
                className={`rounded-[1.4rem] border p-4 text-left transition ${
                  selectedRequest?.id === request.id
                    ? "border-[rgba(45,143,139,0.35)] bg-[rgba(237,250,248,0.82)]"
                    : "border-[var(--border)] bg-white/72 hover:bg-white"
                }`}
              >
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

                {request.images.length ? (
                  <div className="mt-3 flex gap-3">
                    {request.images.slice(0, 2).map((imageUrl) => (
                      <img key={imageUrl} src={imageUrl} alt="" className="h-16 w-16 rounded-[1rem] object-cover" />
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  <span>{formatDateTime(request.createdAt)}</span>
                  {request.isEditable ? (
                    <span className="text-[var(--teal)]">Tahrirlash mumkin</span>
                  ) : null}
                </div>

                {request.isEditable ? (
                  <div className="mt-3">
                    <button
                      type="button"
                      className="text-sm font-semibold text-[var(--amber-deep)]"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleCancel(request.id);
                      }}
                    >
                      So'rovni bekor qilish
                    </button>
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              title="So'rovlar hali yo'q"
              description="Birinchi so'rovingizni shu sahifadan yarating. Yaratilgach, u darhol chap tomondagi ro'yxatda ko'rinadi."
            />
          </div>
        )}
      </DashboardCard>

      <DashboardCard className="min-w-0 xl:sticky xl:top-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[var(--navy)]">
              {mode === "create" ? "Yangi so'rov" : "So'rov tafsiloti"}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {mode === "create"
                ? "Kerakli xizmat haqida qisqa va aniq ma'lumot qoldiring. Istasangiz 2 tagacha rasm biriktiring."
                : "Tanlangan so'rovni ko'ring yoki ochiq holatda bo'lsa tahrirlang."}
            </p>
          </div>
          {mode === "edit" && selectedRequest ? (
            <button
              type="button"
              className="button-secondary cursor-pointer text-sm"
              onClick={() => {
                setSuccessMessage("");
                setMode("create");
                setSelectedRequest(null);
              }}
            >
              Yangi ochish
            </button>
          ) : null}
        </div>

        <div className="mt-5">
          {successMessage ? (
            <div className="mb-4 rounded-[1.3rem] border border-[rgba(45,143,139,0.22)] bg-[rgba(237,250,248,0.92)] px-4 py-3 text-sm text-[var(--teal)]">
              {successMessage}
            </div>
          ) : null}

          {mode === "create" ? (
            <ServiceRequestForm
              submitLabel="So'rov yaratish"
              busyLabel="Saqlanmoqda..."
              loading={submitting}
              regions={regions}
              onSubmit={handleCreate}
            />
          ) : selectedRequest ? (
            selectedRequest.isEditable ? (
              <ServiceRequestForm
                initialRequest={selectedRequest}
                submitLabel="O'zgarishlarni saqlash"
                busyLabel="Yangilanmoqda..."
                loading={submitting}
                regions={regions}
                onSubmit={handleUpdate}
                onCancel={() => {
                  setMode("create");
                  setSelectedRequest(null);
                }}
              />
            ) : (
              <div className="grid gap-4">
                <div className="rounded-[1.4rem] border border-[var(--border)] bg-white/72 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-bold text-[var(--navy)]">{selectedRequest.title}</h3>
                    <StatusBadge status={selectedRequest.status} />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--navy-soft)]">{selectedRequest.description}</p>
                  <p className="mt-3 text-sm text-[var(--muted)]">
                    {selectedRequest.category} - {selectedRequest.city}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--navy-soft)]">
                    {formatRequestBudget(selectedRequest.budgetMin, selectedRequest.budgetMax)}
                  </p>
                  {selectedRequest.images.length ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {selectedRequest.images.map((imageUrl) => (
                        <img key={imageUrl} src={imageUrl} alt="" className="h-40 w-full rounded-[1rem] object-cover" />
                      ))}
                    </div>
                  ) : null}
                </div>
                <EmptyState
                  title="So'rov yopilgan"
                  description="Bu so'rov endi tahrirlanmaydi. Yangi so'rov yaratish orqali davom etishingiz mumkin."
                />
              </div>
            )
          ) : (
            <EmptyState
              title="So'rov tanlanmagan"
              description="Chap tomondan mavjud so'rovni tanlang yoki yangisini yarating."
            />
          )}
        </div>
      </DashboardCard>
    </div>
  );
}
