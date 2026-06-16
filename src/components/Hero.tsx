import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const stats = [
  { label: "Verifications", value: "12M+" },
  { label: "Countries", value: "200+" },
  { label: "Avg. completion", value: "48s" },
  { label: "Pass rate", value: "98.7%" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft gradient backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 backdrop-blur px-3.5 py-1.5 text-xs font-medium text-foreground shadow-[var(--shadow-soft)]"
        >
          <Sparkles className="h-3.5 w-3.5 text-foreground" />
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-badge)" }}>
            Valyd live sandbox
          </span>
          <span className="text-muted-foreground">— every verification flow, no signup</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-6 font-display text-5xl sm:text-6xl md:text-7xl leading-[1.02] text-foreground"
        >
          Identity verification,
          <br />
          <span className="italic text-muted-foreground">felt in real time.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed"
        >
          A polished playground of KYC, biometrics and compliance flows.
          Open any card to launch a live demo and see how the experience feels
          for your customers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <a
            href="#workflows"
            className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:opacity-90 transition-opacity shadow-[var(--shadow-soft)]"
          >
            Explore workflows
          </a>
          <a
            href="#how"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card/80 backdrop-blur px-5 py-3 text-sm font-medium text-foreground hover:bg-card transition-colors"
          >
            Read the docs
          </a>
        </motion.div>

        {/* Trust / stat pills */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-card/80 backdrop-blur px-4 py-4 shadow-[var(--shadow-soft)]"
            >
              <div className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                {s.value}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
