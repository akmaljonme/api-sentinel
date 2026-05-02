import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 group ${className}`}>
      <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-cyan-500 shadow-[0_0_20px_-4px_rgba(99,102,241,0.6)]">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor">
          <path d="M13 2L4.5 13.5h6L9 22l9.5-12.5h-6L13 2z" />
        </svg>
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-foreground">SpecSync</span>
    </Link>
  );
}
