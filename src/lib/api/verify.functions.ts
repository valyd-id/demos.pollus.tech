import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Base URL of the Valyd Verify backend. Server-only (never shipped to client).
// Override with VERIFY_API_URL in the environment; defaults to the local service.
function verifyBase() {
  return process.env.VERIFY_API_URL ?? "http://127.0.0.1:8088";
}

async function asJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, error: { code: "bad_gateway", message: `Upstream ${res.status}` } };
  }
}

/** Start a demo verification session for the requested features. */
export const startVerification = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      features: z.array(z.string()).min(1),
      // Location-match demo: an expected point (+ optional radius) the location check matches against.
      metadata: z
        .object({
          expected_location: z
            .object({
              latitude: z.number(),
              longitude: z.number(),
              radius_m: z.number().nullable().optional(),
            })
            .optional(),
        })
        .optional(),
    }),
  )
  .handler(async ({ data }) => {
    const res = await fetch(`${verifyBase()}/api/demo/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ features: data.features, metadata: data.metadata ?? {} }),
    });
    return asJson(res);
  });

/** Upload a captured image (base64/data-URL) for a session document slot. */
export const uploadDocument = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string(),
      type: z.enum(["id_front", "id_back", "selfie"]),
      image: z.string().min(16),
    }),
  )
  .handler(async ({ data }) => {
    const res = await fetch(`${verifyBase()}/api/hosted/${data.token}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ type: data.type, image: data.image }),
    });
    return asJson(res);
  });

/** Run a single workflow check (id-verification | liveness | face-match | age | credential). */
export const runCheck = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string(),
      check: z.string(),
      dob: z.string().optional(),
      // Extra body fields for the credential check (provider_code, license_state,
      // license_number, names, …). Merged into the POST body.
      payload: z.record(z.string(), z.string()).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const body: Record<string, string> = { ...(data.payload ?? {}) };
    if (data.dob) body.dob = data.dob;
    const res = await fetch(`${verifyBase()}/api/hosted/${data.token}/run/${data.check}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    return asJson(res);
  });

/** List the states/jurisdictions that have credential providers. */
export const credentialStates = createServerFn({ method: "GET" })
  .inputValidator(z.object({ token: z.string() }))
  .handler(async ({ data }) => {
    const res = await fetch(`${verifyBase()}/api/hosted/${data.token}/credential/states`, {
      headers: { Accept: "application/json" },
    });
    return asJson(res);
  });

/** List the credential providers (license types) available for a state. */
export const credentialProviders = createServerFn({ method: "GET" })
  .inputValidator(z.object({ token: z.string(), state: z.string() }))
  .handler(async ({ data }) => {
    const res = await fetch(
      `${verifyBase()}/api/hosted/${data.token}/credential/states/${encodeURIComponent(data.state)}/providers`,
      { headers: { Accept: "application/json" } },
    );
    return asJson(res);
  });

/** Fetch the authoritative (possibly terminal) status + decision of a demo session. */
export const getStatus = createServerFn({ method: "GET" })
  .inputValidator(z.object({ sessionId: z.string() }))
  .handler(async ({ data }) => {
    const res = await fetch(`${verifyBase()}/api/demo/status/${data.sessionId}`, {
      headers: { Accept: "application/json" },
    });
    return asJson(res);
  });
