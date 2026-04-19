"use client";

import { useEffect, useState } from "react";

import { DashboardCard, EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/dashboard/dashboard-ui";
import { UserDashboardShell } from "@/components/dashboard/user-dashboard-shell";
import { getOrder, listOrders, type Order } from "@/lib/dashboard-api";
import type { AuthSession } from "@/lib/auth-storage";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";

export default function OrdersPage() {
  return (
    <UserDashboardShell
      title="Orders"
      description="Mavjud buyurtmalaringizni ko'ring. Bu MVP bosqichida sahifa asosan real ma'lumotlarni o'qish uchun tayyorlandi."
    >
      {(session) => <OrdersContent session={session} />}
    </UserDashboardShell>
  );
}

function OrdersContent({ session }: { session: AuthSession }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const response = await listOrders(session.accessToken, { limit: 20 });

        if (!cancelled) {
          setOrders(response);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Buyurtmalar yuklanmadi.");
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

  async function handleSelect(orderId: string) {
    try {
      const detail = await getOrder(session.accessToken, orderId);
      setSelectedOrder(detail);
    } catch (selectError) {
      setError(selectError instanceof Error ? selectError.message : "Buyurtma tafsiloti yuklanmadi.");
    }
  }

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <DashboardCard>
        <h2 className="text-2xl font-bold text-[var(--navy)]">Buyurtmalar ro'yxati</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Yaratilgan buyurtmalar va ularning holati.</p>

        {error ? <div className="mt-4"><ErrorState message={error} /></div> : null}

        {loading ? (
          <div className="mt-5">
            <LoadingState label="Buyurtmalar yuklanmoqda..." />
          </div>
        ) : orders.length ? (
          <div className="mt-5 grid gap-3">
            {orders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => void handleSelect(order.id)}
                className={`rounded-[1.4rem] border p-4 text-left transition ${
                  selectedOrder?.id === order.id
                    ? "border-[rgba(45,143,139,0.35)] bg-[rgba(237,250,248,0.82)]"
                    : "border-[var(--border)] bg-white/72 hover:bg-white"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--navy)]">Buyurtma #{order.id.slice(0, 8)}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">{order.address}</p>
                    <p className="mt-2 text-sm font-semibold text-[var(--navy-soft)]">
                      {formatCurrency(order.totalPrice)}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  <span>{formatDate(order.date)}</span>
                  <span>{order.paymentType}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              title="Buyurtmalar yo'q"
              description="Hozircha buyurtma yaratilmagan. Savat va buyurtma oqimi keyingi bosqichlarda kengayadi."
            />
          </div>
        )}
      </DashboardCard>

      <DashboardCard>
        <h2 className="text-2xl font-bold text-[var(--navy)]">Buyurtma tafsiloti</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Tanlangan buyurtmaning real ma'lumotlari.</p>

        <div className="mt-5">
          {selectedOrder ? (
            <div className="grid gap-4">
              <div className="rounded-[1.4rem] border border-[var(--border)] bg-white/72 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-2xl font-bold text-[var(--navy)]">Buyurtma #{selectedOrder.id.slice(0, 8)}</h3>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Meta label="Sana" value={formatDateTime(selectedOrder.date)} />
                  <Meta label="To'lov turi" value={selectedOrder.paymentType} />
                  <Meta label="Jami summa" value={formatCurrency(selectedOrder.totalPrice)} />
                  <Meta label="Yetkazib berish" value={selectedOrder.withDelivery ? "Ha" : "Yo'q"} />
                </div>
                <p className="mt-4 text-sm text-[var(--navy-soft)]">Manzil: {selectedOrder.address}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Izoh: {selectedOrder.deliveryComment || "Kiritilmagan"}
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-[var(--border)] bg-[rgba(255,250,242,0.72)] p-4">
                <h4 className="text-lg font-bold text-[var(--navy)]">Itemlar</h4>
                {selectedOrder.items.length ? (
                  <div className="mt-3 grid gap-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="rounded-[1rem] border border-[var(--border)] bg-white/80 px-4 py-3">
                        <p className="text-sm font-semibold text-[var(--navy)]">
                          Soni: {item.count} • Ish vaqti: {item.workingTime} • {item.timeUnit}
                        </p>
                        <p className="mt-1 text-sm text-[var(--muted)]">Narx: {formatCurrency(item.price)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[var(--muted)]">Bu buyurtmada item topilmadi.</p>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              title="Buyurtma tanlanmagan"
              description="Chap tomondan buyurtma tanlang va tafsilotini ko'ring."
            />
          )}
        </div>
      </DashboardCard>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-[var(--border)] bg-[rgba(255,250,242,0.72)] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-sm font-bold text-[var(--navy)]">{value}</p>
    </div>
  );
}
