import { format } from "@lukeed/ms";

export function resetTime(start: number) {
  return format(Date.now() - start, true);
}
