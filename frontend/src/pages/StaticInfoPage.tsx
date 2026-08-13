interface StaticInfoPageProps {
  title: string;
  body: string;
}

export default function StaticInfoPage({ title, body }: StaticInfoPageProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-4 font-display text-2xl font-bold text-ink">{title}</h1>
      <p className="font-body text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
