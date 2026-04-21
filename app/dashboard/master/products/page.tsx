"use client";

import { DashboardCard, EmptyState } from "@/components/dashboard/dashboard-ui";
import { MasterDashboardShell } from "@/components/dashboard/master-dashboard-shell";

export default function MasterProductsPage() {
  return (
    <MasterDashboardShell
      title="Products"
      description="Usta panelidagi mahsulotlar bo'limi. MVP uchun navigatsiya va bo'sh holat tayyorlandi."
    >
      {() => (
        <DashboardCard>
          <EmptyState
            title="Mahsulotlar bo'limi tayyor"
            description="Mahsulotlarni master oqimiga ulash keyingi bosqichda real API talablari bilan qo'shiladi."
          />
        </DashboardCard>
      )}
    </MasterDashboardShell>
  );
}
