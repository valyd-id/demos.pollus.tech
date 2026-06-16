import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Timer,
  CircleDashed,
} from "lucide-react";
import type { Workflow } from "@/lib/workflows";
import { verifyConfigFor } from "@/lib/workflows";
import { CameraCapture } from "@/components/CameraCapture";
import { CredentialStep } from "@/components/CredentialStep";
import { startVerification, uploadDocument, runCheck, getStatus } from "@/lib/api/verify.functions";

type DocType = "id_front" | "id_back" | "selfie";
type Phase = "intro" | "capture" | "credential" | "processing" | "result";

const TERMINAL = ["APPROVED", "DECLINED", "EXPIRED", "ABANDONED", "IN_REVIEW"];

const DOC_META: Record<DocType, { facing: "user" | "environment"; overlay: "card" | "oval"; title: string; hint: string; optional?: boolean }> = {
  id_front: { facing: "environment", overlay: "card", title: "Scan your ID — front", hint: "Place the front of your document inside the frame." },
  id_back: { facing: "environment", overlay: "card", title: "Scan your ID — back", hint: "Now flip it over and capture the back.", optional: true },
  selfie: { facing: "user", overlay: "oval", title: "Take a selfie", hint: "Center your face and look straight at the camera." },
};

const FEATURE_NAME: Record<string, string> = {
  id_verification: "Document check",
  liveness: "Liveness",
  face_match: "Face match",
  age: "Age check",
  credential: "License",
};

// Which documents each feature needs.
const FEATURE_DOCS: Record<string, DocType[]> = {
  id_verification: ["id_front", "id_back"],
  liveness: ["selfie"],
  face_match: ["id_front", "selfie"],
};

function docsForFeatures(features: string[]): DocType[] {
  const seen = new Set<DocType>();
  const out: DocType[] = [];
  for (const f of features) for (const d of FEATURE_DOCS[f] ?? []) if (!seen.has(d)) { seen.add(d); out.push(d); }
  return out;
}

const STATUS_UI: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; title: string; sub: string }> = {
  APPROVED: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", title: "Verification Approved", sub: "The identity has been successfully verified." },
  DECLINED: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", title: "Verification Declined", sub: "We could not verify the identity from the information provided." },
  IN_REVIEW: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", title: "Under Review", sub: "This verification needs a manual review before a final decision." },
  EXPIRED: { icon: Timer, color: "text-slate-500", bg: "bg-slate-100", title: "Session Expired", sub: "This verification session timed out before it was completed." },
  ABANDONED: { icon: CircleDashed, color: "text-slate-500", bg: "bg-slate-100", title: "Verification Abandoned", sub: "The session was closed before completion." },
  IN_PROGRESS: { icon: Loader2, color: "text-sky-600", bg: "bg-sky-50", title: "In Progress", sub: "This verification has not finished yet." },
  NOT_STARTED: { icon: CircleDashed, color: "text-sky-600", bg: "bg-sky-50", title: "Not Started", sub: "This verification has not started yet." },
};

const badgeClass = (s: string) =>
  s === "passed" ? "bg-emerald-50 text-emerald-700"
  : s === "failed" ? "bg-red-50 text-red-700"
  : s === "review" ? "bg-amber-50 text-amber-700"
  : s === "running" ? "bg-sky-50 text-sky-700"
  : "bg-secondary text-muted-foreground";

type SessionData = { session_id: string; session_token: string; features: string[] };
type StatusData = { session_id: string; status: string; checks: { type: string; status: string; error: string | null }[] };

export function VerificationFlow({ workflow, onClose }: { workflow: Workflow | null; onClose: () => void }) {
  const cfg = workflow ? verifyConfigFor(workflow.id) : null;
  const features = cfg?.features ?? [];
  const docs = docsForFeatures(features);
  const hasCredential = features.includes("credential");
  const kycFeatures = features.filter((f) => f !== "credential");

  const [phase, setPhase] = useState<Phase>("intro");
  const [session, setSession] = useState<SessionData | null>(null);
  const [docIndex, setDocIndex] = useState(0);
  const [captures, setCaptures] = useState<Partial<Record<DocType, string>>>({});
  const [checks, setChecks] = useState<Record<string, string>>({});
  const [kycName, setKycName] = useState<string | null>(null);
  const [result, setResult] = useState<StatusData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setPhase("intro"); setSession(null); setDocIndex(0); setCaptures({});
    setChecks({}); setKycName(null); setResult(null); setError(null); setBusy(false);
  };
  const close = () => { reset(); onClose(); };

  const begin = async () => {
    setBusy(true); setError(null);
    try {
      const r = await startVerification({ data: { features } });
      if (!r?.success) throw new Error(r?.error?.message || "Could not start verification");
      setSession(r.data);
      if (docs.length) { setPhase("capture"); setDocIndex(0); }
      else setPhase("credential"); // license-only: no camera, straight to the form
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };

  // After documents are captured, run KYC (if any) then go to the license form.
  const afterCaptures = (caps: Partial<Record<DocType, string>>) => {
    setCaptures(caps);
    if (kycFeatures.length) void runKyc(caps);
    else setPhase("credential");
  };

  const onCaptured = (dataUrl: string) => {
    const type = docs[docIndex];
    const next = { ...captures, [type]: dataUrl };
    setCaptures(next);
    if (docIndex + 1 < docs.length) setDocIndex(docIndex + 1);
    else afterCaptures(next);
  };

  const onSkip = () => {
    if (docIndex + 1 < docs.length) setDocIndex(docIndex + 1);
    else afterCaptures(captures);
  };

  const showResult = async (sessionId: string) => {
    const s = await getStatus({ data: { sessionId } });
    if (!s?.success) throw new Error(s?.error?.message || "Could not load result");
    setResult(s.data);
    setPhase("result");
  };

  // Phase 1: upload documents + run the KYC checks (everything except credential),
  // capturing the OCR'd name. Then branch to the license form, or show the result.
  const runKyc = async (caps: Partial<Record<DocType, string>>) => {
    if (!session) return;
    setPhase("processing"); setError(null);
    try {
      for (const [type, image] of Object.entries(caps)) {
        if (!image) continue;
        const u = await uploadDocument({ data: { token: session.session_token, type: type as DocType, image } });
        if (!u?.success) throw new Error(u?.error?.message || `Upload of ${type} failed`);
      }
      let name: string | null = null;
      for (const f of kycFeatures) {
        setChecks((c) => ({ ...c, [f]: "running" }));
        const res = await runCheck({ data: { token: session.session_token, check: f.replaceAll("_", "-") } });
        if (!res?.success) {
          setChecks((c) => ({ ...c, [f]: "failed" }));
          throw new Error(res?.error?.message || `${FEATURE_NAME[f] ?? f} failed`);
        }
        setChecks((c) => ({ ...c, [f]: res.data.check.status }));
        if (f === "id_verification") name = res.data.check?.data?.fields?.full_name ?? null;
        if (["APPROVED", "DECLINED", "EXPIRED", "ABANDONED"].includes(res.data.session_status)) break;
      }
      const s = await getStatus({ data: { sessionId: session.session_id } });
      if (!s?.success) throw new Error(s?.error?.message || "Could not load result");
      // KYC passed and a license check remains → collect the license details.
      if (hasCredential && !TERMINAL.includes(s.data.status)) {
        setKycName(name); setPhase("credential"); return;
      }
      setResult(s.data); setPhase("result");
    } catch (e) {
      setError((e as Error).message);
      try {
        const s = await getStatus({ data: { sessionId: session.session_id } });
        if (s?.success && TERMINAL.includes(s.data.status)) { setResult(s.data); setPhase("result"); return; }
      } catch { /* ignore */ }
      setPhase(docs.length ? "capture" : "credential");
    }
  };

  // Phase 2: run the credential check with the license details (in KYC+License the
  // name is supplied server-side from the verified ID).
  const runCredentialCheck = async (payload: Record<string, string>) => {
    if (!session) return;
    setPhase("processing"); setError(null);
    try {
      setChecks((c) => ({ ...c, credential: "running" }));
      const res = await runCheck({ data: { token: session.session_token, check: "credential", payload } });
      if (!res?.success) {
        setChecks((c) => ({ ...c, credential: "failed" }));
        throw new Error(res?.error?.message || "License check failed");
      }
      setChecks((c) => ({ ...c, credential: res.data.check.status }));
      await showResult(session.session_id);
    } catch (e) {
      setError((e as Error).message);
      try {
        const s = await getStatus({ data: { sessionId: session.session_id } });
        if (s?.success && TERMINAL.includes(s.data.status)) { setResult(s.data); setPhase("result"); return; }
      } catch { /* ignore */ }
      setPhase("credential");
    }
  };

  const open = Boolean(workflow);
  const doc = docs[docIndex];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        >
          <motion.div
            role="dialog" aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-card border border-border shadow-[var(--shadow-lift)]"
          >
            <button onClick={close} aria-label="Close" className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full bg-secondary border border-border flex items-center justify-center text-foreground hover:bg-card transition-colors">
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 sm:p-8">
              {/* INTRO */}
              {phase === "intro" && workflow && (
                <div className="text-center">
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-primary-soft border border-border flex items-center justify-center text-primary mb-4">
                    <ShieldCheck className="h-7 w-7" strokeWidth={1.75} />
                  </div>
                  <h2 className="font-display text-3xl text-foreground">{workflow.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{workflow.description}</p>

                  <div className="mt-6 rounded-2xl border border-border bg-secondary/50 p-4 text-left">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">This demo will run</p>
                    <ul className="space-y-2">
                      {features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary" /> {FEATURE_NAME[f] ?? f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

                  <button onClick={begin} disabled={busy} className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {busy ? "Starting…" : "Begin verification"}
                  </button>
                  <p className="mt-3 text-xs text-muted-foreground">Camera access is requested on the next step. Nothing is stored after the demo.</p>
                </div>
              )}

              {/* CAPTURE */}
              {phase === "capture" && doc && (
                <div>
                  <div className="flex items-center justify-center gap-1.5 mb-5">
                    {docs.map((d, i) => (
                      <span key={d} className={`h-1.5 rounded-full transition-all ${i === docIndex ? "w-6 bg-primary" : i < docIndex ? "w-6 bg-primary/40" : "w-3 bg-border"}`} />
                    ))}
                  </div>
                  <CameraCapture
                    key={doc}
                    facingMode={DOC_META[doc].facing}
                    overlay={DOC_META[doc].overlay}
                    title={DOC_META[doc].title}
                    hint={DOC_META[doc].hint}
                    onCapture={onCaptured}
                    onSkip={DOC_META[doc].optional ? onSkip : undefined}
                  />
                  {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
                </div>
              )}

              {/* CREDENTIAL (license form) */}
              {phase === "credential" && session && (
                <div>
                  <CredentialStep
                    token={session.session_token}
                    kycName={kycName}
                    onSubmit={(payload) => void runCredentialCheck(payload)}
                  />
                  {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
                </div>
              )}

              {/* PROCESSING */}
              {phase === "processing" && (
                <div className="py-6 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                  <p className="mt-4 text-sm text-muted-foreground">Verifying your identity…</p>
                  <div className="mt-6 space-y-2 text-left max-w-xs mx-auto">
                    {features.map((f) => (
                      <div key={f} className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5">
                        <span className="text-sm text-foreground">{FEATURE_NAME[f] ?? f}</span>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeClass(checks[f] ?? "pending")}`}>
                          {checks[f] ?? "pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RESULT — credential workflows: just "found / not found" */}
              {phase === "result" && result && hasCredential && (() => {
                const cred = result.checks.find((c) => c.type === "credential");
                const found = cred?.status === "passed";
                const Icon = found ? CheckCircle2 : XCircle;
                return (
                  <div className="text-center">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">License check</div>
                    <div className={`mx-auto mt-4 h-16 w-16 rounded-full ${found ? "bg-emerald-50" : "bg-red-50"} flex items-center justify-center`}>
                      <Icon className={`h-8 w-8 ${found ? "text-emerald-600" : "text-red-600"}`} />
                    </div>
                    <h2 className={`mt-3 font-display text-2xl ${found ? "text-emerald-600" : "text-red-600"}`}>
                      {found ? "License verified" : "License not found"}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {found
                        ? "We found this license and confirmed it is valid."
                        : "We couldn't confirm this license for the details provided."}
                    </p>
                    <div className="mt-6 flex gap-3">
                      <button onClick={reset} className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors">Run again</button>
                      <button onClick={close} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">Done</button>
                    </div>
                  </div>
                );
              })()}

              {/* RESULT — other workflows */}
              {phase === "result" && result && !hasCredential && (() => {
                const ui = STATUS_UI[result.status] ?? STATUS_UI.IN_PROGRESS;
                const Icon = ui.icon;
                return (
                  <div className="text-center">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Verification Results</div>
                    <div className={`mx-auto mt-4 h-16 w-16 rounded-full ${ui.bg} flex items-center justify-center`}>
                      <Icon className={`h-8 w-8 ${ui.color}`} />
                    </div>
                    <h2 className={`mt-3 font-display text-2xl ${ui.color}`}>{ui.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{ui.sub}</p>

                    <div className="mt-5 space-y-2 text-left">
                      {result.checks.map((c) => (
                        <div key={c.type} className="rounded-xl border border-border bg-card px-3 py-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-foreground">{FEATURE_NAME[c.type] ?? c.type}</span>
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeClass(c.status)}`}>{c.status}</span>
                          </div>
                          {c.error && <p className="mt-1 text-xs text-red-600">{c.error}</p>}
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 text-left">
                      <div className="text-xs text-muted-foreground">Session ID</div>
                      <code className="mt-1 block break-all rounded-lg bg-foreground px-3 py-2 text-xs text-background">{result.session_id}</code>
                    </div>

                    <p className="mt-4 text-xs text-muted-foreground bg-secondary/60 rounded-lg p-3">
                      This is a demo session. In production, verification data is returned to your backend via a signed webhook.
                    </p>

                    <div className="mt-5 flex gap-3">
                      <button onClick={reset} className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors">Run again</button>
                      <button onClick={close} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">Done</button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
