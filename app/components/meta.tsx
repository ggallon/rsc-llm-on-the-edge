import { LimitStatus, type RateInfo } from "./blocked";
import { Region } from "./region";

interface MetaProps {
  proxy: string;
  compute: string;
  rateinfo: RateInfo;
}

export function Meta({ proxy, compute, rateinfo }: MetaProps) {
  return (
    <div className="meta">
      <div className="info">
        <span>Proxy Region</span>
        <Region region={proxy} />
      </div>
      <div className="info">
        <span>Compute Region</span>
        <Region region={compute} />
      </div>
      <div className="info">
        <span>Ratelimit</span>
        <LimitStatus rateinfo={rateinfo} />
      </div>
    </div>
  );
}
