export interface KeyProps {
  isoCountry: string;
  city: string;
  timezone: string;
}

export const getCacheKey = ({ isoCountry, city, timezone }: KeyProps) => {
  return `rllm:${isoCountry}:${city}:${timezone.replace(/\//g, "-")}`
    .replaceAll(" ", "_")
    .toLowerCase();
};
