"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import OutcomesPage from "../outcomes/page";

export default function OutcomeRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/outcomes");
  }, [router]);

  return <OutcomesPage />;
}
