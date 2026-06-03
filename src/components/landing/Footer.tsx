import { Logo } from "@/components/Logo";
import { Github, Twitter, Linkedin } from "lucide-react";

const cols = [
  { title: "Mahsulot", links: ["Mock Serverlar", "Drift Detection", "CI/CD", "Integratsiyalar", "Yangiliklar"] },
  { title: "Kompaniya", links: ["Biz haqimizda", "Mijozlar", "Karyera", "Blog", "Aloqa"] },
  { title: "Huquqiy", links: ["Maxfiylik", "Shartlar", "Xavfsizlik", "DPA", "Subprotsessorlar"] },
  { title: "Dasturchilar", links: ["Hujjatlar", "API ma'lumotnoma", "Holat", "Ochiq kod", "Jamiyat"] },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-6">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-text-secondary">
              Production'ni hech qachon buzmaydigan API oqimlari. Mock, test va ishonch bilan jo'nating.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="/signup" className="grid h-9 w-9 place-items-center rounded-md border border-border text-text-secondary hover:text-foreground hover:border-border-hover transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">{c.title}</div>
              <ul className="mt-4 space-y-3 text-sm">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="/signup" className="text-text-secondary hover:text-foreground transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">© 2026 Flowt Inc. · flowt.dev</p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> SOC2 Type II
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> GDPR Mos
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
