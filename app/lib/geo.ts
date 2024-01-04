import COUNTRIES from "./countries";

const fakeGeo = {
  localised: true,
  isoCountry: "FR",
  country: "France",
  //isoCountryRegion: "NAQ",
  city: "Bordeaux",
} as const;

export const getGeo = (headersList: Headers) => {
  if (!headersList.get("X-Vercel-Id")) {
    console.log('"x-vercel-id" header not present. Running on localhost?');
    return fakeGeo;
  }

  let city = headersList.get("X-Vercel-IP-City");
  const localised = !!city;
  city = !!city ? decodeURIComponent(city) : "Unknown";
  const isoCountry = headersList.get("X-Vercel-IP-Country") ?? "UK"; // UK for Unknown
  const country = COUNTRIES[isoCountry] ?? "Unknown";

  return { localised, isoCountry, country, city };
};
