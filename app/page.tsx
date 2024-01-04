import { Suspense } from "react";
import { OpenAIStream } from "ai";
import { Tokens } from "ai/react";
import { headers } from "next/headers";
import OpenAI from "openai";
import { kv } from "@vercel/kv";

import { Footer } from "./components/footer";
import { Main } from "./components/main";
import { Meta } from "./components/meta";

import { detectBot } from "./lib/bot";
import { getCacheKey } from "./lib/key";
import { getGeo } from "./lib/geo";
import { parseVercelId } from "./lib/parse-vercel-id";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function Page() {
  const headersList = headers();
  const { city, country } = getGeo(headersList);
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
              <Wrapper country={country} city={city} timezone={timezone} />
            </Suspense>
          </pre>
        )}
      </Main>
      <Meta proxy={proxyRegion} compute={computeRegion} />
      <Footer />
    </>
  );
}

// We add a wrapper component to avoid suspending the entire page while the OpenAI request is being made
async function Wrapper({
  country,
  city,
  timezone,
}: {
  country: string;
  city: string;
  timezone: string;
}) {
  const key = await getCacheKey({ country, city, timezone });
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
