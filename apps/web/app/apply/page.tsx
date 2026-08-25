"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ApplicationsPage from "../applications/page";

export default function ApplyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/applications");
  }, [router]);

  return <ApplicationsPage />;
}
