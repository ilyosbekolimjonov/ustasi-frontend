"use client";

import { DashboardCard, EmptyState } from "@/components/dashboard/dashboard-ui";
import { MasterDashboardShell } from "@/components/dashboard/master-dashboard-shell";

export default function MasterBasketPage() {
  return (
    <MasterDashboardShell
      title="Basket"
      description="Usta panelidagi savat bo'limi. MVP bosqichida navigatsiya va sahifa struktura sifatida tayyorlandi."
    >
      {() => (
        <DashboardCard>
          <EmptyState
            title="Savat bo'limi tayyor"
            description="Bu yer keyingi bosqichda ustalar uchun instrument yoki xizmat savati oqimiga ulanadi."
          />
        </DashboardCard>
      )}
    </MasterDashboardShell>
  );
}
