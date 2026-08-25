"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import GapsPage from "../gaps/page";

export default function GapRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/gaps");
  }, [router]);

  return <GapsPage />;
}
