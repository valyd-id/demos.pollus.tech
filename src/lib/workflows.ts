export type Workflow = {
  id: string;
  title: string;
  tag: string;
  description: string;
  longDescription: string;
  features: string[];
  accent: string; // tailwind gradient class
  icon: string;
};

// Maps each catalog card to the real Valyd Verify features it runs in the live
// camera demo. `available: false` flows are shown as "Coming soon" (no engine yet).
export type VerifyConfig = { available: boolean; features: string[] };

export const WORKFLOW_VERIFY: Record<string, VerifyConfig> = {
  "core-kyc": { available: true, features: ["id_verification", "liveness", "face_match"] },
  license: { available: true, features: ["credential"] },
  "kyc-license": { available: true, features: ["id_verification", "liveness", "face_match", "credential"] },
  liveness: { available: true, features: ["liveness"] },
  "face-auth": { available: true, features: ["id_verification", "face_match"] },
};

export function verifyConfigFor(id: string): VerifyConfig {
  return WORKFLOW_VERIFY[id] ?? { available: false, features: [] };
}

export const workflows: Workflow[] = [
  {
    id: "core-kyc",
    title: "Core KYC",
    tag: "Identity",
    description: "Verify a user's identity with a government ID and a quick selfie check.",
    longDescription:
      "Run a complete Know-Your-Customer flow in under two minutes. Capture an ID document, extract data via OCR, and confirm the person matches with a passive selfie check.",
    features: [
      "ID document capture & OCR",
      "Selfie match with confidence score",
      "200+ countries supported",
      "Re-usable verified profile",
    ],
    accent: "from-sky-200/60 via-indigo-200/40 to-transparent",
    icon: "id",
  },
  {
    id: "license",
    title: "License Verification",
    tag: "Credential",
    description: "Verify a professional license against the official state registry.",
    longDescription:
      "Confirm a professional license (medical, nursing, legal, business and more) directly against the issuing state board. The user picks their state and license type, enters the license number, and we verify it live — no ID required.",
    features: [
      "Live lookup against state registries",
      "50+ states & jurisdictions",
      "Hundreds of license types",
      "Simple verified / not-found result",
    ],
    accent: "from-amber-200/60 via-yellow-200/40 to-transparent",
    icon: "badge",
  },
  {
    id: "kyc-license",
    title: "KYC + License",
    tag: "Credential",
    description: "Verify identity, then confirm the license belongs to that verified person.",
    longDescription:
      "A full Know-Your-Customer flow (ID + selfie with liveness and face match) followed by a license check. The name is read from the verified ID and used for the registry lookup, so a license that belongs to someone else is rejected.",
    features: [
      "ID + selfie KYC up front",
      "Name taken from the verified ID",
      "License matched to the real person",
      "Verified / not-found result",
    ],
    accent: "from-emerald-200/60 via-teal-200/40 to-transparent",
    icon: "shield",
  },
  {
    id: "liveness",
    title: "Liveness",
    tag: "Biometrics",
    description: "Confirm a real human is present, not a photo, mask, or deepfake.",
    longDescription:
      "Passive liveness detection that runs in the background while users frame their face. Designed to defeat printed photos, screen replays, masks and AI-generated faces.",
    features: [
      "Passive — no head turns required",
      "iBeta Level 2 certified",
      "<1s decision on device",
      "Deepfake & injection defense",
    ],
    accent: "from-violet-200/60 via-fuchsia-200/40 to-transparent",
    icon: "eye",
  },
  {
    id: "face-auth",
    title: "Face Auth",
    tag: "Returning users",
    description: "Re-authenticate verified users with a one-tap face check.",
    longDescription:
      "Once a user is verified, let them log in or approve actions with their face. Tied to the original verified template, so no passwords or one-time codes needed.",
    features: [
      "Sub-second match",
      "Cross-device support",
      "Step-up for sensitive actions",
      "On-device template encryption",
    ],
    accent: "from-rose-200/60 via-orange-200/40 to-transparent",
    icon: "face",
  },
];
