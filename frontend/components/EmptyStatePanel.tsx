"use client";

type EmptyStatePanelProps = {
  title: string;
  description: string;
};

export function EmptyStatePanel({ title, description }: EmptyStatePanelProps) {
  return (
    <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-8 text-center">
      <div className="max-w-sm">
        <p className="text-sm font-semibold text-text">{title}</p>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      </div>
    </div>
  );
}
