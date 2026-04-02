"use client";

import { useState } from "react";

type Result =
  | {
      ok: true;
      elapsedMs: number;
      trainedRows: number;
      scoredRows: number;
      usedModel: boolean;
      scoredAtIso: string;
    }
  | { ok: false; elapsedMs: number; error: string };

export default function RunScoringClient() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/scoring/run", { method: "POST" });
      const json = (await res.json()) as Result;
      setResult(json);
    } catch (e) {
      setResult({ ok: false, elapsedMs: 0, error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-white p-4">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {loading ? "Running..." : "Run Scoring"}
      </button>

      {result ? (
        <div className="mt-4 rounded-md border bg-zinc-50 p-3 text-sm text-black">
          {result.ok ? (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div>
                <dt className="text-xs text-black">Status</dt>
                <dd className="font-medium text-black">Success</dd>
              </div>
              <div>
                <dt className="text-xs text-black">Elapsed</dt>
                <dd className="font-medium text-black">
                  {Math.round(result.elapsedMs)} ms
                </dd>
              </div>
              <div>
                <dt className="text-xs text-black">Trained rows</dt>
                <dd className="font-medium text-black">
                  {result.trainedRows}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-black">Scored orders</dt>
                <dd className="font-medium text-black">
                  {result.scoredRows}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-black">Used ML model</dt>
                <dd className="font-medium text-black">
                  {result.usedModel ? "Yes" : "Fallback heuristic"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-black">Scored at</dt>
                <dd className="font-medium text-black">{result.scoredAtIso}</dd>
              </div>
            </dl>
          ) : (
            <div className="text-red-800">
              <div className="font-medium">Failed</div>
              <div className="mt-1 text-xs">{result.error}</div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

