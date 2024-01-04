interface MainProps {
  bot: boolean;
  country: string;
  city: string;
  children: React.ReactNode;
}

export function Main({ bot, country, city, children }: MainProps) {
  return (
    <main>
      <h1 className="title">
        {bot ? (
          <span>You won$apos;t believe you're on Earth...</span>
        ) : (
          <>
            <span>What to do in </span>
            {city}, {country}?
          </>
        )}
      </h1>
      {children}
    </main>
  );
}
