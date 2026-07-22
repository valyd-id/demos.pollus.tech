import valydLogo from "@/assets/valyd-logo.png";

const DOCS_URL = import.meta.env.VITE_DOCS_URL ?? "https://docs.valyd.work/verify";
const CONSOLE_URL = import.meta.env.VITE_CONSOLE_URL ?? "https://dev.valyd.work";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <a href="https://idp.valyd.work" className="flex items-center gap-2 group" aria-label="Valyd home">
          <img src={valydLogo} alt="Valyd" className="h-6 w-auto" />
          <span className="ml-2 hidden sm:inline-flex items-center rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Sandbox
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#workflows" className="hover:text-foreground transition-colors">Workflows</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Documentation
          </a>
          <a
            href={CONSOLE_URL}
            className="inline-flex items-center rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}
