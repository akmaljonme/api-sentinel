import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 glass transition-colors duration-200 ${
        scrolled ? "border-b border-border" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-1 text-sm text-text-secondary">
          {["Product", "Docs", "Pricing", "News"].map((l) => (
              <a key={l} href="/signup" className="rounded-md px-3 py-1.5 hover:text-foreground hover:bg-white/5 transition-colors">
                {l}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden sm:inline-flex h-9 items-center rounded-md px-3 text-sm text-text-secondary hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="inline-flex h-9 items-center rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_8px_24px_-12px_rgba(99,102,241,0.6)] hover:bg-primary-hover transition-colors duration-150"
          >
            Start for free
          </Link>
        </div>
      </div>
    </header>
  );
}
