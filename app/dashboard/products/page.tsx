"use client";

import { useEffect, useState } from "react";

import { DashboardCard, EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/dashboard/dashboard-ui";
import { UserDashboardShell } from "@/components/dashboard/user-dashboard-shell";
import { getProduct, listProducts, type Product } from "@/lib/dashboard-api";
import type { AuthSession } from "@/lib/auth-storage";
import { formatCurrency } from "@/lib/format";

export default function ProductsPage() {
  return (
    <UserDashboardShell
      title="Products"
      description="Platformadagi mavjud mahsulot va instrumentlarni ko'ring."
    >
      {(session) => <ProductsContent session={session} />}
    </UserDashboardShell>
  );
}

function ProductsContent({ session }: { session: AuthSession }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");
      const response = await listProducts(session.accessToken, {
        limit: 18,
        search: search || undefined,
      });
      setProducts(response.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Mahsulotlar yuklanmadi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.accessToken]);

  async function handleSelect(productId: string) {
    try {
      const detail = await getProduct(session.accessToken, productId);
      setSelectedProduct(detail);
    } catch (selectError) {
      setError(selectError instanceof Error ? selectError.message : "Mahsulot tafsiloti yuklanmadi.");
    }
  }

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <DashboardCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label className="text-sm font-bold text-[var(--navy)]">Qidiruv</label>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="auth-input mt-2"
              placeholder="Mahsulot nomi yoki brand"
            />
          </div>
          <button type="button" className="button-primary cursor-pointer text-sm" onClick={() => void loadProducts()}>
            Qidirish
          </button>
        </div>

        {error ? <div className="mt-4"><ErrorState message={error} /></div> : null}

        {loading ? (
          <div className="mt-5">
            <LoadingState label="Mahsulotlar yuklanmoqda..." />
          </div>
        ) : products.length ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => void handleSelect(product.id)}
                className={`overflow-hidden rounded-[1.4rem] border text-left transition ${
                  selectedProduct?.id === product.id
                    ? "border-[rgba(45,143,139,0.35)] bg-[rgba(237,250,248,0.82)]"
                    : "border-[var(--border)] bg-white/72 hover:bg-white"
                }`}
              >
                <img src={product.imageUrl} alt={product.title} className="h-44 w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--navy)]">{product.title}</h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">{product.category}</p>
                    </div>
                    {product.isActive ? <StatusBadge status="ACTIVE" /> : null}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[var(--navy-soft)]">{formatCurrency(product.price)}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">Omborda: {product.stock}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState title="Mahsulot topilmadi" description="Hozircha ko'rsatish uchun mahsulot yo'q." />
          </div>
        )}
      </DashboardCard>

      <DashboardCard>
        <h2 className="text-2xl font-bold text-[var(--navy)]">Mahsulot tafsiloti</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Tanlangan mahsulot haqida asosiy ma'lumot.</p>

        <div className="mt-5">
          {selectedProduct ? (
            <div className="grid gap-4">
              <img src={selectedProduct.imageUrl} alt={selectedProduct.title} className="h-72 w-full rounded-[1.6rem] object-cover" />
              <div className="rounded-[1.4rem] border border-[var(--border)] bg-white/72 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-2xl font-bold text-[var(--navy)]">{selectedProduct.title}</h3>
                  {selectedProduct.isActive ? <StatusBadge status="ACTIVE" /> : null}
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">{selectedProduct.category}</p>
                <p className="mt-4 text-sm leading-7 text-[var(--navy-soft)]">{selectedProduct.description}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Meta label="Narx" value={formatCurrency(selectedProduct.price)} />
                  <Meta label="Qoldiq" value={String(selectedProduct.stock)} />
                  <Meta label="Brand" value={selectedProduct.brand?.name ?? "Ko'rsatilmagan"} />
                  <Meta label="Kod" value={String(selectedProduct.code)} />
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Mahsulot tanlanmagan"
              description="Chap tomondagi mahsulotlardan birini bosing."
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
