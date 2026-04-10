"use client";

import { useEffect, useMemo, useState } from "react";

import { DashboardCard, EmptyState, ErrorState, LoadingState } from "@/components/dashboard/dashboard-ui";
import { UserDashboardShell } from "@/components/dashboard/user-dashboard-shell";
import { deleteBasketItem, listBasket, updateBasketItem, type BasketItem } from "@/lib/dashboard-api";
import type { AuthSession } from "@/lib/auth-storage";
import { formatCurrency, getLocalizedName } from "@/lib/format";

export default function BasketPage() {
  return (
    <UserDashboardShell
      title="Basket"
      description="Savatdagi itemlarni ko'ring, miqdor yoki ish vaqtini yangilang va keraksizlarini o'chiring."
    >
      {(session) => <BasketContent session={session} />}
    </UserDashboardShell>
  );
}

function BasketContent({ session }: { session: AuthSession }) {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function loadItems() {
    try {
      setLoading(true);
      setError("");
      const response = await listBasket(session.accessToken, { limit: 50 });
      setItems(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Savat yuklanmadi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.accessToken]);

  const estimatedTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.estimatedTotal, 0),
    [items],
  );

  async function handleSave(item: BasketItem, nextValues: { count: number; workingTime: number; timeUnit: "HOUR" | "DAY" }) {
    try {
      setBusyId(item.id);
      const updated = await updateBasketItem(session.accessToken, item.id, nextValues);
      setItems((current) => current.map((entry) => (entry.id === item.id ? updated : entry)));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Savat itemi yangilanmadi.");
    } finally {
      setBusyId("");
    }
  }

  async function handleDelete(itemId: string) {
    try {
      setBusyId(itemId);
      await deleteBasketItem(session.accessToken, itemId);
      setItems((current) => current.filter((item) => item.id !== itemId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Item o'chirilmadi.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="grid gap-5">
      <DashboardCard>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--navy)]">Savat holati</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Jami itemlar: {items.length}</p>
          </div>
          <div className="rounded-[1.3rem] bg-[rgba(255,250,242,0.86)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Taxminiy jami</p>
            <p className="mt-2 text-2xl font-bold text-[var(--navy)]">{formatCurrency(estimatedTotal)}</p>
          </div>
        </div>
      </DashboardCard>

      {error ? <ErrorState message={error} /> : null}

      {loading ? (
        <LoadingState label="Savat yuklanmoqda..." />
      ) : items.length ? (
        <div className="grid gap-4">
          {items.map((item) => (
            <BasketItemCard
              key={item.id}
              item={item}
              busy={busyId === item.id}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Savat bo'sh"
          description="Savatga hali hech narsa qo'shilmagan. Hozircha mavjud itemlar bilan ishlash sahifasi tayyor."
        />
      )}
    </div>
  );
}

function BasketItemCard({
  item,
  busy,
  onSave,
  onDelete,
}: {
  item: BasketItem;
  busy: boolean;
  onSave: (item: BasketItem, nextValues: { count: number; workingTime: number; timeUnit: "HOUR" | "DAY" }) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
}) {
  const [count, setCount] = useState(String(item.count));
  const [workingTime, setWorkingTime] = useState(String(item.workingTime));
  const [timeUnit, setTimeUnit] = useState<"HOUR" | "DAY">(item.timeUnit);

  useEffect(() => {
    setCount(String(item.count));
    setWorkingTime(String(item.workingTime));
    setTimeUnit(item.timeUnit);
  }, [item]);

  return (
    <DashboardCard>
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex gap-4">
          <img src={item.tool.image} alt="" className="h-24 w-24 rounded-[1.4rem] object-cover" />
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold text-[var(--navy)]">{getLocalizedName(item.tool, "Instrument")}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {getLocalizedName(item.profession, "Kasb")} • {getLocalizedName(item.level, "Daraja")}
            </p>
            <p className="mt-2 text-sm text-[var(--navy-soft)]">
              Instrument narxi: {formatCurrency(item.tool.price)}
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--navy)]">
              Taxminiy jami: {formatCurrency(item.estimatedTotal)}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <InputField label="Soni" value={count} onChange={setCount} />
          <InputField label="Ish vaqti" value={workingTime} onChange={setWorkingTime} />
          <div className="grid gap-2">
            <label className="text-sm font-bold text-[var(--navy)]">Birlik</label>
            <select value={timeUnit} onChange={(event) => setTimeUnit(event.target.value as "HOUR" | "DAY")} className="auth-input">
              <option value="HOUR">Soat</option>
              <option value="DAY">Kun</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="button-primary cursor-pointer text-sm"
          disabled={busy}
          onClick={() =>
            void onSave(item, {
              count: Number(count),
              workingTime: Number(workingTime),
              timeUnit,
            })
          }
        >
          {busy ? "Saqlanmoqda..." : "Yangilash"}
        </button>
        <button type="button" className="button-secondary cursor-pointer text-sm" disabled={busy} onClick={() => void onDelete(item.id)}>
          O'chirish
        </button>
      </div>
    </DashboardCard>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-bold text-[var(--navy)]">{label}</label>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="auth-input" type="number" min="1" />
    </div>
  );
}
