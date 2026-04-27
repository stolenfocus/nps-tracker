"use client";

export default function AdSlot({ label }: { label?: string }) {
  return (
    <div className="my-4 flex items-center justify-center min-h-[90px] bg-navy-light/50 border border-navy-lighter rounded text-slate-600 text-[10px]">
      {label || "Advertisement"}
    </div>
  );
}
