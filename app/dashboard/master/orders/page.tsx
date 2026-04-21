"use client";

import { DashboardCard, EmptyState } from "@/components/dashboard/dashboard-ui";
import { MasterDashboardShell } from "@/components/dashboard/master-dashboard-shell";

export default function MasterOrdersPage() {
  return (
    <MasterDashboardShell
      title="Orders"
      description="Usta panelidagi buyurtmalar bo'limi. Hozircha MVP placeholder sifatida navigatsiyaga ulandi."
    >
      {() => (
        <DashboardCard>
          <EmptyState
            title="Buyurtmalar bo'limi tayyor"
            description="Master buyurtmalari uchun backend oqimi aniqlangach, real ro'yxat shu sahifaga ulanadi."
          />
        </DashboardCard>
      )}
    </MasterDashboardShell>
  );
}
