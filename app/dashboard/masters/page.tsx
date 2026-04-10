"use client";

import { useEffect, useState } from "react";

import { DashboardCard, EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/dashboard/dashboard-ui";
import { UserDashboardShell } from "@/components/dashboard/user-dashboard-shell";
import { getMaster, listMasters, type MasterProfile } from "@/lib/dashboard-api";
import type { AuthSession } from "@/lib/auth-storage";

export default function MastersPage() {
  return (
    <UserDashboardShell
      title="Masters"
      description="Ustalarni ko'rib chiqing, filtrlang va ular haqidagi asosiy ma'lumotlarni oching."
    >
      {(session) => <MastersContent session={session} />}
    </UserDashboardShell>
  );
}

function MastersContent({ session: _session }: { session: AuthSession }) {
  const [masters, setMasters] = useState<MasterProfile[]>([]);
  const [selectedMaster, setSelectedMaster] = useState<MasterProfile | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadMasters() {
    try {
      setLoading(true);
      setError("");
      const response = await listMasters({
        limit: 12,
        search: search || undefined,
        category: category || undefined,
        city: city || undefined,
      });

      setMasters(response.items);

      if (selectedMaster) {
        const match = response.items.find((item) => item.id === selectedMaster.id);
        setSelectedMaster(match ?? null);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Ustalar yuklanmadi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMasters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSelect(master: MasterProfile) {
    try {
      const detailed = await getMaster(master.slug || master.id);
      setSelectedMaster(detailed);
    } catch (selectError) {
      setError(selectError instanceof Error ? selectError.message : "Usta tafsiloti yuklanmadi.");
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <DashboardCard>
        <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_1fr_auto]">
          <FilterField label="Qidiruv" value={search} onChange={setSearch} placeholder="Ism yoki soha" />
          <FilterField label="Kategoriya" value={category} onChange={setCategory} placeholder="Masalan, Elektrik" />
          <FilterField label="Shahar" value={city} onChange={setCity} placeholder="Masalan, Samarqand" />
          <button type="button" className="button-primary cursor-pointer text-sm" onClick={() => void loadMasters()}>
            Filtrlash
          </button>
        </div>

        {error ? <div className="mt-4"><ErrorState message={error} /></div> : null}

        {loading ? (
          <div className="mt-5">
            <LoadingState label="Ustalar yuklanmoqda..." />
          </div>
        ) : masters.length ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {masters.map((master) => (
              <button
                key={master.id}
                type="button"
                onClick={() => void handleSelect(master)}
                className={`rounded-[1.4rem] border p-4 text-left transition ${
                  selectedMaster?.id === master.id
                    ? "border-[rgba(45,143,139,0.35)] bg-[rgba(237,250,248,0.82)]"
                    : "border-[var(--border)] bg-white/72 hover:bg-white"
                }`}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={master.profileImageUrl || master.avatarUrl || "/icon.png"}
                    alt={master.fullName}
                    className="h-16 w-16 rounded-[1.2rem] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-[var(--navy)]">{master.fullName}</h3>
                      {master.isAvailable ? <StatusBadge status="ACTIVE" /> : null}
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {master.category} • {master.city}
                    </p>
                    <p className="mt-2 text-sm text-[var(--navy-soft)]">
                      Reyting {master.ratingAverage.toFixed(1)} • {master.jobsCompletedCount} ish
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{master.experienceText}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              title="Usta topilmadi"
              description="Filtrlarni o'zgartirib ko'ring yoki keyinroq qayta kiring."
            />
          </div>
        )}
      </DashboardCard>

      <DashboardCard>
        <h2 className="text-2xl font-bold text-[var(--navy)]">Usta tafsiloti</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Tanlangan usta haqida qisqa profil.</p>

        <div className="mt-5">
          {selectedMaster ? (
            <div className="grid gap-4">
              <img
                src={selectedMaster.profileImageUrl || selectedMaster.avatarUrl || "/icon.png"}
                alt={selectedMaster.fullName}
                className="h-64 w-full rounded-[1.6rem] object-cover"
              />
              <div className="rounded-[1.4rem] border border-[var(--border)] bg-white/72 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-2xl font-bold text-[var(--navy)]">{selectedMaster.fullName}</h3>
                  {selectedMaster.isAvailable ? <StatusBadge status="ACTIVE" /> : null}
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {selectedMaster.category} • {selectedMaster.city}
                  {selectedMaster.region ? ` • ${selectedMaster.region}` : ""}
                </p>
                <p className="mt-3 text-sm font-medium text-[var(--navy-soft)]">
                  Reyting {selectedMaster.ratingAverage.toFixed(1)} • Yakunlangan ishlar {selectedMaster.jobsCompletedCount}
                </p>
                <p className="mt-4 text-sm leading-7 text-[var(--navy-soft)]">{selectedMaster.bio}</p>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{selectedMaster.experienceText}</p>
                <p className="mt-4 text-sm font-semibold text-[var(--navy)]">{selectedMaster.phone}</p>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Usta tanlanmagan"
              description="Chap tomondagi kartalardan birini tanlab, profil tafsilotini oching."
            />
          )}
        </div>
      </DashboardCard>
    </div>
  );
}

function FilterField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-bold text-[var(--navy)]">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="auth-input"
        placeholder={placeholder}
      />
    </div>
  );
}
