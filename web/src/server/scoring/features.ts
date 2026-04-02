export type FeatureRow = {
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
};

export const FEATURE_NAMES = [
  "order_total",
  "order_subtotal",
  "shipping_fee",
  "tax_amount",
  "promo_used",
  "risk_score",
  "total_quantity",
  "distinct_products",
  "avg_unit_price",
  "promised_days",
] as const;

export type FeatureName = (typeof FEATURE_NAMES)[number];

export function toFeatureVector(row: FeatureRow, promisedDaysFallback: number) {
  const promisedDays =
    row.promised_days == null || !Number.isFinite(row.promised_days)
      ? promisedDaysFallback
      : Number(row.promised_days);

  return [
    Number(row.order_total) || 0,
    Number(row.order_subtotal) || 0,
    Number(row.shipping_fee) || 0,
    Number(row.tax_amount) || 0,
    Number(row.promo_used) || 0,
    Number(row.risk_score) || 0,
    Number(row.total_quantity) || 0,
    Number(row.distinct_products) || 0,
    Number(row.avg_unit_price) || 0,
    promisedDays || 0,
  ];
}

export function computeMedian(nums: number[]): number {
  const xs = nums.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (xs.length === 0) return 0;
  const mid = Math.floor(xs.length / 2);
  if (xs.length % 2 === 1) return xs[mid];
  return (xs[mid - 1] + xs[mid]) / 2;
}

