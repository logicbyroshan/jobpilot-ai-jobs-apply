"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import OpportunitiesPage from "../opportunities/page";

export default function MatchRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/opportunities");
  }, [router]);

  return <OpportunitiesPage />;
}
