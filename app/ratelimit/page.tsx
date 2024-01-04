import { headers } from "next/headers";
import Link from "next/link";

import { Footer } from "../components/footer";
import { Meta } from "../components/meta";
import { LimitStatus } from "../components/blocked";

import { parseVercelId } from "../lib/parse-vercel-id";

export const runtime = "edge";

export default async function Page() {
  const headersList = headers();
  const { proxyRegion, computeRegion } = parseVercelId(
    headersList.get("X-Vercel-Id"),
  );

  return (
    <>
      <main>
        <h1 className="title">RamteLimit</h1>
        <LimitStatus />
        <Link href="/" prefetch={false}>
          Return to home
        </Link>
      </main>
      <Meta proxy={proxyRegion} compute={computeRegion} />
      <Footer />
    </>
  );
}
