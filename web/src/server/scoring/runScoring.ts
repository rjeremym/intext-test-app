import { supabaseAdmin } from "@/server/supabaseAdmin";
import { computeMedian, toFeatureVector, type FeatureRow } from "./features";
import { fitLogisticRegression } from "./logreg";

type TrainingRow = FeatureRow & { label_late_delivery: number };
type RawTrainingRow = {
  order_id: number;
  order_total: number;
  order_subtotal: number;
  shipping_fee: number;
  tax_amount: number;
  promo_used: number;
  risk_score: number;
  total_quantity: number;
  distinct_products: number;
  avg_unit_price: number;
  promised_days: number | null;
  label_late_delivery: number;
};

type RawOrderFeatureRow = {
  order_id: number;
  order_total: number;
  order_subtotal: number;
  shipping_fee: number;
  tax_amount: number;
  promo_used: number;
  risk_score: number;
  total_quantity: number;
  distinct_products: number;
  avg_unit_price: number;
};

type RawShipmentPromised = { order_id: number; promised_days: number };

export type RunScoringResult = {
  trainedRows: number;
  scoredRows: number;
  usedModel: boolean;
  scoredAtIso: string;
};

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

export async function runScoring(): Promise<RunScoringResult> {
  const sb = supabaseAdmin();

  // Training set: labeled shipments joined to order features.
  const { data: trainData, error: trainError } = await sb
    .from("vw_training_late_delivery")
    .select(
      "order_id, order_total, order_subtotal, shipping_fee, tax_amount, promo_used, risk_score, total_quantity, distinct_products, avg_unit_price, promised_days, label_late_delivery",
    )
    .limit(5000);

  if (trainError) throw new Error(`Training query failed: ${trainError.message}`);

  const trainingRows: TrainingRow[] = ((trainData ?? []) as RawTrainingRow[]).map((r) => ({
    order_id: Number(r.order_id),
    order_total: Number(r.order_total),
    order_subtotal: Number(r.order_subtotal),
    shipping_fee: Number(r.shipping_fee),
    tax_amount: Number(r.tax_amount),
    promo_used: Number(r.promo_used),
    risk_score: Number(r.risk_score),
    total_quantity: Number(r.total_quantity),
    distinct_products: Number(r.distinct_products),
    avg_unit_price: Number(r.avg_unit_price),
    promised_days: r.promised_days == null ? null : Number(r.promised_days),
    label_late_delivery: Number(r.label_late_delivery),
  }));

  const promisedDaysFallback = computeMedian(
    trainingRows
      .map((r) => r.promised_days ?? NaN)
      .filter((n) => Number.isFinite(n)),
  );

  const X = trainingRows.map((r) => toFeatureVector(r, promisedDaysFallback));
  const y = trainingRows.map((r) => (r.label_late_delivery ? 1 : 0));

  const model = fitLogisticRegression(X, y);

  // Score set: all orders with features. promised_days comes from shipments when present.
  const { data: scoreData, error: scoreError } = await sb
    .from("vw_order_features")
    .select(
      "order_id, order_total, order_subtotal, shipping_fee, tax_amount, promo_used, risk_score, total_quantity, distinct_products, avg_unit_price",
    )
    .limit(20000);

  if (scoreError) throw new Error(`Scoring query failed: ${scoreError.message}`);

  // Pull promised_days separately (left join shipments isn't directly expressible via PostgREST easily for a view)
  const orderIds = ((scoreData ?? []) as RawOrderFeatureRow[])
    .map((r) => Number(r.order_id))
    .filter(Number.isFinite);
  const { data: shipmentData } =
    orderIds.length > 0
      ? await sb
          .from("shipments")
          .select("order_id, promised_days")
          .in("order_id", orderIds)
      : { data: [] as RawShipmentPromised[] };

  const promisedByOrder = new Map(
    ((shipmentData ?? []) as RawShipmentPromised[]).map((s) => [
      Number(s.order_id),
      Number(s.promised_days),
    ]),
  );

  const scoredAtIso = new Date().toISOString();

  const predictionsPayload = ((scoreData ?? []) as RawOrderFeatureRow[]).map((r) => {
    const row: FeatureRow = {
      order_id: Number(r.order_id),
      order_total: Number(r.order_total),
      order_subtotal: Number(r.order_subtotal),
      shipping_fee: Number(r.shipping_fee),
      tax_amount: Number(r.tax_amount),
      promo_used: Number(r.promo_used),
      risk_score: Number(r.risk_score),
      total_quantity: Number(r.total_quantity),
      distinct_products: Number(r.distinct_products),
      avg_unit_price: Number(r.avg_unit_price),
      promised_days: promisedByOrder.get(Number(r.order_id)) ?? null,
    };

    let p: number;
    if (model) {
      p = model.predictProba(toFeatureVector(row, promisedDaysFallback));
    } else {
      // Fallback heuristic: mostly driven by risk_score + shipping_fee.
      p = 0.15 + 0.006 * (row.risk_score || 0) + 0.02 * (row.shipping_fee || 0);
    }

    const prob = clamp01(p);
    const pred = prob >= 0.5 ? 1 : 0;

    return {
      order_id: row.order_id,
      late_delivery_probability: prob,
      predicted_late_delivery: pred,
      scored_at: scoredAtIso,
    };
  });

  // Upsert in chunks to avoid payload limits.
  let totalUpserted = 0;
  const chunkSize = 500;
  for (let i = 0; i < predictionsPayload.length; i += chunkSize) {
    const chunk = predictionsPayload.slice(i, i + chunkSize);
    const { error: upsertError } = await sb
      .from("order_predictions")
      .upsert(chunk, { onConflict: "order_id" });
    if (upsertError) throw new Error(`Upsert failed: ${upsertError.message}`);
    totalUpserted += chunk.length;
  }

  return {
    trainedRows: trainingRows.length,
    scoredRows: totalUpserted,
    usedModel: Boolean(model),
    scoredAtIso,
  };
}

