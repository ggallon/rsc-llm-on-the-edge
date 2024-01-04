"use client";

import { useSearchParams } from "next/navigation";

export function LimitStatus() {
  const searchParams = useSearchParams();
  const limit = searchParams.get("limit");
  const remaining = searchParams.get("remaining");
  const reset = searchParams.get("reset");

  // URL -> `/dashboard?search=my-project`
  // `search` -> 'my-project'
  return (
    <ul>
      <li>"X-RateLimit-Limit: {limit}</li>
      <li>X-RateLimit-Remaining: {remaining}</li>
      <li>X-RateLimit-Reset: {reset}</li>
    </ul>
  );
}
