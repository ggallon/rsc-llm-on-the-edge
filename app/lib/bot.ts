export const detectBot = (headersList: Headers) => {
  const ua = headersList.get("user-agent");
  if (ua) {
    /* Note:
     * - bot is for most bots & crawlers
     * - Twitterbot is for Twitter
     * - Vercelbot is for Vercel scranshoot
     * - ChatGPT is for ChatGPT
     * - facebookexternalhit is for Facebook crawler
     * - WhatsApp is for WhatsApp crawler
     * - MetaInspector is for https://metatags.io/
     */
    return /bot|Twitterbot|Vercelbot|chatgpt|facebookexternalhit|WhatsApp|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex|MetaInspector/i.test(
      ua,
    );
  }
  return false;
};
