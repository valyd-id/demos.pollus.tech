import valydLogo from "@/assets/valyd-logo.png";

const columns = [
  {
    title: "Product",
    links: ["Core KYC", "License Verification", "KYC + License", "Liveness", "Face Auth"],
  },
  {
    title: "Resources",
    links: ["Documentation", "API Reference", "Changelog", "Status", "Guides"],
  },
  {
    title: "Company",
    links: ["About", "Customers", "Careers", "Press kit", "Contact"],
  },
];

export function SiteFooter() {
  return (
    <footer id="footer" className="relative border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img src={valydLogo} alt="Valyd" className="h-5 w-auto" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              An interactive sandbox for the Valyd identity platform. Explore every verification flow before you integrate.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Valyd. Sandbox experience for demonstration purposes.
          </p>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
