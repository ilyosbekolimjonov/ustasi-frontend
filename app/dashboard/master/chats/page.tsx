"use client";

import { DashboardChatsContent } from "@/components/dashboard/dashboard-chats-content";
import { MasterDashboardShell } from "@/components/dashboard/master-dashboard-shell";

export default function MasterChatsPage() {
  return (
    <MasterDashboardShell
      title="Chats"
      description="Qabul qilingan ishlar bo'yicha mijozlar bilan muloqotlarni boshqaring."
    >
      {(session) => <DashboardChatsContent session={session} />}
    </MasterDashboardShell>
  );
}
