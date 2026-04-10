"use client";

import type { ReactNode } from "react";

export function DashboardCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`self-start rounded-[1.6rem] border border-[var(--border)] bg-white/80 p-5 shadow-[0_16px_40px_rgba(23,32,51,0.08)] backdrop-blur ${className}`}
    >
      {children}
    </section>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-[rgba(23,32,51,0.14)] bg-[rgba(255,250,242,0.72)] px-5 py-8 text-center">
      <h3 className="text-lg font-bold text-[var(--navy)]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ label = "Yuklanmoqda..." }: { label?: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/70 px-5 py-8 text-center text-sm font-semibold text-[var(--navy-soft)]">
      {label}
    </div>
  );
}

export function ErrorState({
  message,
  action,
}: {
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[rgba(207,122,18,0.22)] bg-[rgba(255,248,235,0.92)] px-5 py-4 text-sm text-[var(--amber-deep)]">
      <p>{message}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();

  const palette =
    normalized === "OPEN"
      ? "bg-[rgba(45,143,139,0.14)] text-[var(--teal)]"
      : normalized === "DONE" || normalized === "COMPLETED"
        ? "bg-[rgba(66,153,92,0.14)] text-[#2f7a45]"
        : normalized === "CANCELLED"
          ? "bg-[rgba(207,122,18,0.14)] text-[var(--amber-deep)]"
          : normalized === "CLAIMED" || normalized === "ACTIVE"
            ? "bg-[rgba(23,32,51,0.12)] text-[var(--navy)]"
            : "bg-[rgba(23,32,51,0.08)] text-[var(--navy-soft)]";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${palette}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
