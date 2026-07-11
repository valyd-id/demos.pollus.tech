import { motion } from "framer-motion";
import {
  IdCard,
  ShieldCheck,
  Eye,
  ScanFace,
  KeyRound,
  Cake,
  Home,
  BadgeCheck,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import type { Workflow } from "@/lib/workflows";

const iconMap: Record<string, LucideIcon> = {
  id: IdCard,
  shield: ShieldCheck,
  eye: Eye,
  face: ScanFace,
  key: KeyRound,
  cake: Cake,
  home: Home,
  badge: BadgeCheck,
  location: MapPin,
};

type Props = {
  workflow: Workflow;
  index: number;
  onOpen: (w: Workflow) => void;
};

export function WorkflowCard({ workflow, index, onOpen }: Props) {
  const Icon = iconMap[workflow.icon] ?? IdCard;

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(workflow)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col items-start text-left p-6 rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Open ${workflow.title} demo`}
    >
      {/* gradient blob */}
      <div
        className={`pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl opacity-70 bg-gradient-to-br ${workflow.accent}`}
      />

      <div className="relative flex items-center gap-3 mb-5">
        <div className="h-11 w-11 rounded-xl bg-primary-soft border border-border flex items-center justify-center text-primary">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
          {workflow.tag}
        </span>
      </div>

      <h3 className="relative text-xl font-semibold text-foreground mb-2">
        {workflow.title}
      </h3>
      <p className="relative text-sm text-muted-foreground leading-relaxed">
        {workflow.description}
      </p>

      <div className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
        <span>Try the demo</span>
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </motion.button>
  );
}
