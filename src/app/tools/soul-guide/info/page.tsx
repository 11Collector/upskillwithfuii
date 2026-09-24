"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SoulGuideInfoRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tools/ai-mentor/info");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
