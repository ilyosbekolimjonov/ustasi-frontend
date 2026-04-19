"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MasterDashboardIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/master/home");
  }, [router]);

  return null;
}
