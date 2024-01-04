export interface KeyProps {
  country: string;
  city: string;
  timezone: string;
}

export const getCacheKey = ({ country, city, timezone }: KeyProps) => {
  return `rllm:${country}:${city}:${timezone.replace(/\//g, "-")}`
    .replaceAll(" ", "_")
    .toLowerCase();
};
