export const urlHost = (): string => {
  let url: string = "none";

  switch (process.env.NEXT_PUBLIC_VERCEL_ENV) {
    case "production":
      url = "https://rsc-llm.vercel.app";
      break;
    case "preview":
      url = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
      break;
    default:
      url = `http://localhost:${process.env.PORT || 3000}`;
  }

  return url;
};
