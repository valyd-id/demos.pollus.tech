import valydLogo from "@/assets/valyd-logo.png";

// Product links map to workflow ids — clicking one scrolls to the catalog and
// opens that workflow's demo popup (handled by the page via onSelectWorkflow).
const productLinks: { label: string; id: string }[] = [
  { label: "Core KYC", id: "core-kyc" },
  { label: "License Verification", id: "license" },
  { label: "KYC + License", id: "kyc-license" },
  { label: "Liveness", id: "liveness" },
  { label: "Face Auth", id: "face-auth" },
];

export function SiteFooter({
  onSelectWorkflow,
}: {
  onSelectWorkflow?: (id: string) => void;
}) {
  return (
    <footer id="footer" className="relative border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-2">
              <img src={valydLogo} alt="Valyd" className="h-5 w-auto" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              An interactive sandbox for the Valyd identity platform. Explore every verification flow before you integrate.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Product</h4>
            <ul className="mt-4 space-y-2.5">
              {productLinks.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => onSelectWorkflow?.(l.id)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Valyd. Sandbox experience for demonstration purposes.
          </p>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <a href="https://idp.valyd.work/privacy" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="https://idp.valyd.work/terms" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
