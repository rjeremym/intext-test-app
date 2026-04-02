export type RunScoringResult = {
  trainedRows: number;
  scoredRows: number;
  usedModel: boolean;
  scoredAtIso: string;
};

export async function runScoring(): Promise<RunScoringResult> {
  const apiUrl = process.env.SCORING_API_URL ?? "https://ml-model-is455-predictfraud-production.up.railway.app";

  const res = await fetch(`${apiUrl}/run-scoring`, { method: "POST" });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Scoring API error: ${res.status} ${text}`);
  }

  const json = await res.json() as { scored: number };

  return {
    trainedRows: 0,
    scoredRows: json.scored,
    usedModel: true,
    scoredAtIso: new Date().toISOString(),
  };
}
