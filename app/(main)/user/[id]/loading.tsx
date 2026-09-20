export default function UserByIdLoading() {
  return (
    <section className="mx-auto w-full max-w-2xl animate-pulse">
      <div className="flex items-center gap-3">
        <div className="bg-muted size-16 rounded-full" />
        <div className="flex flex-col gap-2">
          <div className="bg-muted h-6 w-40 rounded-md" />
          <div className="bg-muted h-4 w-24 rounded-md" />
        </div>
      </div>

      <div className="border-border mt-6 overflow-hidden rounded-lg border">
        <div className="border-border h-20 border-b p-4" />
        <div className="h-20 p-4" />
      </div>
    </section>
  );
}
