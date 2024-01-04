import { headers } from "next/headers";
import { Footer } from "./components/footer";
import { Region } from "./components/region";
import { parseVercelId } from "./parse-vercel-id";
import { OpenAIStream } from "ai";
import OpenAI from "openai";
import { Suspense } from "react";
import { Tokens } from "ai/react";
import { kv } from "@vercel/kv";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function Page() {
  const headersList = headers();
  const city = decodeURIComponent(
    headersList.get("X-Vercel-IP-City") || "Bordeaux",
  );

  const timezone = headersList.get("X-Vercel-IP-Timezone") || "Europe/Paris";

  const { proxyRegion, computeRegion } = parseVercelId(
    headersList.get("X-Vercel-Id"),
  );

  if (headersList.get("user-agent")?.includes("Twitterbot")) {
    return <></>;
  }

  return (
    <>
      <main>
        <h1 className="title">
          <span>What to do in </span>
          {city}?
        </h1>
        <pre className="tokens">
          <Suspense fallback={null}>
            <Wrapper city={city} timezone={timezone} />
          </Suspense>
        </pre>
      </main>
      <div className="meta">
        <div className="info">
          <span>Proxy Region</span>
          <Region region={proxyRegion} />
        </div>
        <div className="info">
          <span>Compute Region</span>
          <Region region={computeRegion} />
        </div>
      </div>
      <Footer />
    </>
  );
}

// We add a wrapper component to avoid suspending the entire page while the OpenAI request is being made
async function Wrapper({ city, timezone }: { city: string; timezone: string }) {
  const binome = `rllm:${city}-${timezone.replace("/", "-")}`;
  // See https://sdk.vercel.ai/docs/concepts/caching
  const cached = (await kv.get(binome)) as string | undefined;

  if (cached) {
    const chunks = cached.split(" ");
    const stream = new ReadableStream({
      async start(controller) {
        for (const chunk of chunks) {
          const bytes = new TextEncoder().encode(chunk + " ");
          controller.enqueue(bytes);
          await new Promise((r) =>
            setTimeout(
              r,
              // get a random number between 10ms and 50ms to simulate a random delay
              Math.floor(Math.random() * 40) + 10,
            ),
          );
        }
        controller.close();
      },
    });

    return <Tokens stream={stream} />;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: true,
    messages: [
      {
        role: "user",
        content:
          "Act like as if you are a travel expert. Provide a list of 5 things to do in " +
          city +
          " in the " +
          // The timezone helps the AI decide the correct state / location
          timezone +
          " timezone and start with 'here's a...'. Do NOT mention the timezone in your response.",
      },
    ],
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      await kv.set(binome, completion);
      await kv.expire(binome, 60 * 10);
    },
  });

  return <Tokens stream={stream} />;
}
