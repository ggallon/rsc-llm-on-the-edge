import { Region } from "./region";

interface MetaProps {
  proxy: string;
  compute: string;
}

export function Meta({ proxy, compute }: MetaProps) {
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
    </div>
  );
}
