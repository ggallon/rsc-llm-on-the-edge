import { Suspense } from "react";
import { OpenAIStream } from "ai";
import { Tokens } from "ai/react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import OpenAI from "openai";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

import { Footer } from "./components/footer";
import { Main } from "./components/main";
import { Meta } from "./components/meta";

import { detectBot } from "./lib/bot";
import { getIP } from "./lib/ip";
import { getCacheKey } from "./lib/key";
import { getGeo } from "./lib/geo";
import { parseVercelId } from "./lib/parse-vercel-id";

export const runtime = "edge";

const cache = new Map();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ratelimit = new Ratelimit({
  redis: kv,
  // rate limit to 3 requests per 10 seconds
  limiter: Ratelimit.slidingWindow(3, "10s"),
  ephemeralCache: cache,
});

export default async function Page() {
  const headersList = headers();
  const ip = getIP(headersList);
  const { success, limit, reset, remaining } = await ratelimit.limit(
    `rllm:ratelimit:${ip}`,
  );

  if (!success) {
    redirect("/ratelimit");
  }

  const rateinfo = { reset, remaining, limit };
  const { city, country, isoCountry } = getGeo(headersList);
  const timezone = headersList.get("X-Vercel-IP-Timezone") || "Europe/Paris";
  const { proxyRegion, computeRegion } = parseVercelId(
    headersList.get("X-Vercel-Id"),
  );

  const isBot = detectBot(headersList);

  return (
    <>
      <Main bot={isBot} country={country} city={city}>
        {isBot ? (
          <p>The Earth was made to travel.</p>
        ) : (
          <pre className="tokens">
            <Suspense fallback={null}>
              <Wrapper
                isoCountry={isoCountry}
                country={country}
                city={city}
                timezone={timezone}
              />
            </Suspense>
          </pre>
        )}
      </Main>
      <Meta proxy={proxyRegion} compute={computeRegion} rateinfo={rateinfo} />
      <Footer />
    </>
  );
}

// We add a wrapper component to avoid suspending the entire page while the OpenAI request is being made
async function Wrapper({
  isoCountry,
  country,
  city,
  timezone,
}: {
  isoCountry: string;
  country: string;
  city: string;
  timezone: string;
}) {
  const key = getCacheKey({ isoCountry, city, timezone });
  // See https://sdk.vercel.ai/docs/concepts/caching
  const cached = (await kv.get(key)) as string | undefined;

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
          ", " +
          country +
          " with the " +
          // The timezone helps the AI decide the correct state / location
          timezone +
          " timezone and start with 'here's a...'. Do NOT mention the timezone in your response.",
      },
    ],
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      await kv.set(key, completion);
      await kv.expire(key, 60 * 10);
    },
  });

  return <Tokens stream={stream} />;
}
