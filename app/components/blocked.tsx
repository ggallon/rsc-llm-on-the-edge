import { resetTime } from "../lib/date";

export interface RateInfo {
  reset: number;
  remaining: number;
  limit: number;
}

export function LimitStatus({ rateinfo }: { rateinfo: RateInfo }) {
  return (
    <span className="region">
      <strong>
        {rateinfo.remaining}/{rateinfo.limit}
      </strong>{" "}
      <span className="region-code">({resetTime(rateinfo.reset)})</span>
    </span>
  );
}
