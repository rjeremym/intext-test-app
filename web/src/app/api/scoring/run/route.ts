import { NextResponse } from "next/server";
import { runScoring } from "@/server/scoring/runScoring";

export const dynamic = "force-dynamic";

export async function POST() {
  const startedAt = Date.now();
  try {
    const result = await runScoring();
    const elapsedMs = Date.now() - startedAt;
    return NextResponse.json({ ok: true, elapsedMs, ...result });
  } catch (err) {
    const elapsedMs = Date.now() - startedAt;
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, elapsedMs, error: message }, { status: 500 });
  }
}

