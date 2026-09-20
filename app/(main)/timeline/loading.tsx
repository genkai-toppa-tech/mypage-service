export default function TimelineLoading() {
  return (
    <section className="mx-auto w-full max-w-2xl animate-pulse">
      <div className="bg-muted h-7 w-32 rounded-md" />
      <div className="bg-muted mt-2 h-4 w-96 max-w-full rounded-md" />

      <div className="border-border mt-6 overflow-hidden rounded-lg border">
        <div className="border-border h-16 border-b p-4" />
        <div className="border-border h-24 border-b p-4" />
        <div className="border-border h-24 border-b p-4" />
        <div className="h-24 p-4" />
      </div>
    </section>
  );
}
