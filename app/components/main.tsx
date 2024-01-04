interface MainProps {
  city: string;
  children: React.ReactNode;
}

export function Main({ city, children }: MainProps) {
  return (
    <main>
      <h1 className="title">
        <span>What to do in </span>
        {city}?
      </h1>
      {children}
    </main>
  );
}
