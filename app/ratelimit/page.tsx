import Link from "next/link";

import { Footer } from "../components/footer";

export default async function Page() {
  return (
    <>
      <main>
        <h1 className="title">Rate Limit Exceeded</h1>
        <Link href="/" prefetch={false}>
          Return to home
        </Link>
      </main>
      <Footer />
    </>
  );
}
