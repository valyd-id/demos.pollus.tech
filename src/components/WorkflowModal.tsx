import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useEffect } from "react";
import type { Workflow } from "@/lib/workflows";
import { verifyConfigFor } from "@/lib/workflows";

type Props = {
  workflow: Workflow | null;
  onClose: () => void;
  onLaunch: (w: Workflow) => void;
};

export function WorkflowModal({ workflow, onClose, onLaunch }: Props) {
  const available = workflow ? verifyConfigFor(workflow.id).available : false;
  // ESC to close
  useEffect(() => {
    if (!workflow) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [workflow, onClose]);

  return (
    <AnimatePresence>
      {workflow && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="workflow-modal-title"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg rounded-3xl bg-card border border-border shadow-[var(--shadow-lift)] overflow-hidden"
          >
            {/* gradient header */}
            <div className={`relative h-32 bg-gradient-to-br ${workflow.accent} border-b border-border`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,white,transparent_60%)]" />
              <div className="absolute bottom-4 left-6 inline-flex items-center gap-2 rounded-full bg-card/80 backdrop-blur px-3 py-1 text-xs font-medium text-foreground border border-border">
                {workflow.tag}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="absolute top-4 right-4 h-9 w-9 rounded-full bg-card/80 backdrop-blur border border-border flex items-center justify-center text-foreground hover:bg-card transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 sm:p-8">
              <h2 id="workflow-modal-title" className="text-2xl font-semibold text-foreground">
                {workflow.title}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {workflow.longDescription}
              </p>

              <ul className="mt-6 space-y-3">
                {workflow.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-primary-soft border border-border flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-primary" strokeWidth={3} />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={!available}
                  onClick={() => workflow && onLaunch(workflow)}
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {available ? "Launch demo" : "Coming soon"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  {available ? "View docs" : "Close"}
                </button>
              </div>
              {!available && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  This flow isn't wired into the live sandbox yet.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
