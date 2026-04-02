import RunScoringClient from "./runScoringClient";

export const dynamic = "force-dynamic";

export default function ScoringPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Run Scoring</h1>
      <p className="mt-2 text-sm text-black">
        This triggers the server-side scoring job. It (re)trains a small model
        from historical labeled shipments (<code>shipments.late_delivery</code>)
        and writes predictions into <code>order_predictions</code>. Then the
        Priority Queue page reads the top 50 by probability.
      </p>

      <div className="mt-6">
        <RunScoringClient />
      </div>
    </div>
  );
}

