import { Link } from "@tanstack/react-router";

export function Logo({ className = "", linkTo = true }: { className?: string; linkTo?: boolean }) {
  const inner = (
    <>
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="shrink-0">
        <path
          d="M4 24 Q10 6 16 16 Q22 26 28 8"
          stroke="#8B5CF6"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="28" cy="8" r="3.5" fill="#6366F1" />
      </svg>
      <span className="font-mono text-[16px] font-bold tracking-tight text-foreground">
        flow<span className="text-[#8B5CF6]">t</span>
      </span>
    </>
  );
  if (!linkTo) return <span className={`flex items-center gap-2 ${className}`}>{inner}</span>;
  return (
    <Link to="/" className={`flex items-center gap-2 group ${className}`}>
      {inner}
    </Link>
  );
}
