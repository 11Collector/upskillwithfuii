"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AiMentorRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tools/soul-guide");
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
