import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export default function Loading() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <LoadingSkeleton className="h-28" />
      <LoadingSkeleton className="h-28" />
      <LoadingSkeleton className="h-28" />
      <LoadingSkeleton className="h-28" />
      <LoadingSkeleton className="h-72 md:col-span-2" />
      <LoadingSkeleton className="h-72 md:col-span-2" />
    </section>
  );
}