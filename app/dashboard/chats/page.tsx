"use client";

import { DashboardChatsContent } from "@/components/dashboard/dashboard-chats-content";
import { UserDashboardShell } from "@/components/dashboard/user-dashboard-shell";

export default function UserChatsPage() {
  return (
    <UserDashboardShell
      title="Chats"
      description="Qabul qilingan so'rovlar bo'yicha ustalar bilan yozishmalarni bir joyda ko'ring."
    >
      {(session) => <DashboardChatsContent session={session} />}
    </UserDashboardShell>
  );
}
