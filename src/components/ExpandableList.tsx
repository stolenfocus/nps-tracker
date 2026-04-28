"use client";

import { useState, ReactNode } from "react";

export default function ExpandableList({
  children,
  totalCount,
  initialCount,
  showAllLabel = "Show all",
  showLessLabel = "Show less",
}: {
  children: ReactNode;
  totalCount: number;
  initialCount: number;
  showAllLabel?: string;
  showLessLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const items = Array.isArray(children) ? children : [children];
  const visible = expanded ? items : items.slice(0, initialCount);
  const canExpand = totalCount > initialCount;

  return (
    <>
      {visible}
      {canExpand && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-center text-[10px] text-slate-500 hover:text-slate-300 py-1.5 transition-colors"
        >
          {expanded ? showLessLabel : `${showAllLabel} ${totalCount}`}
        </button>
      )}
    </>
  );
}
