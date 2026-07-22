import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { WorkflowCard } from "@/components/WorkflowCard";
import { WorkflowModal } from "@/components/WorkflowModal";
import { VerificationFlow } from "@/components/VerificationFlow";
import { SiteFooter } from "@/components/SiteFooter";
import { workflows, type Workflow } from "@/lib/workflows";

const CONSOLE_URL = import.meta.env.VITE_CONSOLE_URL ?? "https://dev.valyd.work";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Valyd Sandbox — Try every identity verification flow" },
      {
        name: "description",
        content:
          "Interactive sandbox for the Valyd identity platform. Try Core KYC, License Verification, KYC + License, liveness and face auth live — no signup required.",
      },
      { property: "og:title", content: "Valyd Sandbox — Identity verification demos" },
      {
        property: "og:description",
        content:
          "A polished sandbox of KYC, biometrics and compliance flows from Valyd. Open any card and launch a live demo.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap",
      },
    ],
  }),
  component: Index,
});

const howSteps = [
  {
    n: "01",
    title: "Pick a workflow",
    body: "Browse the catalog and choose the verification flow that matches your use case.",
  },
  {
    n: "02",
    title: "Run the live demo",
    body: "Open the modal and step through the experience exactly as your end users would.",
  },
  {
    n: "03",
    title: "Ship to production",
    body: "Copy the snippet, drop it into your app and go live with a single API call.",
  },
];

function Index() {
  const [active, setActive] = useState<Workflow | null>(null);
  const [launched, setLaunched] = useState<Workflow | null>(null);

  // Deep link: `?flow=<workflow-id>` (or `?demo=`) launches that verification straight away, so the
  // "Try it live" buttons in the docs (docs.valyd.work) can open a specific flow in a new tab —
  // the same experience as clicking a card here, no embedded iframe.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("flow") ?? params.get("demo");
    if (!id) return;
    const w = workflows.find((x) => x.id === id);
    if (w) setLaunched(w);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <Hero />

        {/* Workflows */}
        <section id="workflows" className="relative mx-auto max-w-6xl px-5 sm:px-8 pb-24">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl text-foreground">
                A workflow for every moment of trust.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                Click any card to open the demo. Each flow runs the real experience with mock data.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All systems operational</span>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {workflows.map((w, i) => (
              <WorkflowCard key={w.id} workflow={w} index={i} onOpen={setActive} />
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="relative border-t border-border bg-secondary/40">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl sm:text-4xl text-foreground">
                From curiosity to integration in three steps.
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                The sandbox mirrors production. What you click here is what your customers will feel.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {howSteps.map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="relative rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
                >
                  <div className="font-display text-3xl text-muted-foreground">{s.n}</div>
                  <h3 className="mt-3 text-lg font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-5 sm:px-8 py-24">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 sm:p-14 text-center shadow-[var(--shadow-soft)]">
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{ background: "var(--gradient-hero)" }}
            />
            <h2 className="font-display text-3xl sm:text-5xl text-foreground">
              Ready to verify your first user?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
              Spin up a free workspace and ship identity verification this afternoon.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={CONSOLE_URL}
                className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Get started free
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Talk to sales
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter
        onSelectWorkflow={(id) => {
          const w = workflows.find((x) => x.id === id);
          if (!w) return;
          document.getElementById("workflows")?.scrollIntoView({ behavior: "smooth" });
          window.setTimeout(() => setActive(w), 350);
        }}
      />

      <WorkflowModal
        workflow={active}
        onClose={() => setActive(null)}
        onLaunch={(w) => {
          setActive(null);
          setLaunched(w);
        }}
      />

      <VerificationFlow workflow={launched} onClose={() => setLaunched(null)} />
    </div>
  );
}
