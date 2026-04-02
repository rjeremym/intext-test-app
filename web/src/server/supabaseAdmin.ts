import { createClient } from "@supabase/supabase-js";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

/** Trim and strip accidental wrapping quotes from Vercel/UI paste. */
function sanitizeEnvValue(raw: string): string {
  let s = raw.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

export function supabaseAdmin() {
  const urlRaw = sanitizeEnvValue(requiredEnv("NEXT_PUBLIC_SUPABASE_URL"));
  const serviceKey = sanitizeEnvValue(requiredEnv("SUPABASE_SERVICE_ROLE_KEY"));

  let url: string;
  try {
    const parsed = new URL(urlRaw);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("URL must start with https://");
    }
    url = urlRaw;
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL must be a full URL like https://YOUR_PROJECT_REF.supabase.co (got: ${JSON.stringify(urlRaw.slice(0, 80))}${urlRaw.length > 80 ? "…" : ""}). Remove quotes/spaces in Vercel env settings.`,
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
