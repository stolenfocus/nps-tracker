"use client";

import { useState, ReactNode, Children } from "react";

interface Props {
  totalCount: number;
  initialCount: number;
  showAllLabel?: string;
  showLessLabel?: string;
  children: ReactNode;
}

export default function ExpandableList({
  totalCount,
  initialCount,
  showAllLabel = "Show all",
  showLessLabel = "Show less",
  children,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const items = Children.toArray(children);
  const visible = expanded ? items : items.slice(0, initialCount);

  return (
    <div>
      {visible}
      {totalCount > initialCount && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
        >
          {expanded ? showLessLabel : `${showAllLabel} (${totalCount})`}
        </button>
      )}
    </div>
  );
}
