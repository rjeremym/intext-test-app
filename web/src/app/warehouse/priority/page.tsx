import { formatOrderDatetime } from "@/lib/formatOrderDatetime";
import { supabaseAdmin } from "@/server/supabaseAdmin";

export const dynamic = "force-dynamic";

type PriorityRow = {
  order_id: number;
  order_datetime: string;
  order_total: number;
  customer_id: number;
  customer_name: string;
  late_delivery_probability: number;
  predicted_late_delivery: number;
  scored_at: string;
};

export default async function WarehousePriorityPage() {
  const sb = supabaseAdmin();

  // Priority queue = top 50 by predicted probability (all orders).
  const { data, error } = await sb
    .from("vw_priority_queue")
    .select(
      "order_id, order_datetime, order_total, customer_id, customer_name, late_delivery_probability, predicted_late_delivery, scored_at",
    )
    .order("late_delivery_probability", { ascending: false })
    .limit(50);

  const rows: PriorityRow[] = (data ?? []).map((r) => ({
    order_id: Number(r.order_id),
    order_datetime: String(r.order_datetime ?? ""),
    order_total: Number(r.order_total ?? 0),
    customer_id: Number(r.customer_id ?? 0),
    customer_name: String(r.customer_name ?? ""),
    late_delivery_probability: Number(r.late_delivery_probability),
    predicted_late_delivery: Number(r.predicted_late_delivery),
    scored_at: String(r.scored_at),
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">
        Late Delivery Priority Queue
      </h1>
      <p className="mt-2 text-sm text-black">
        Shows the top 50 orders sorted by the model’s predicted probability of{" "}
        <strong>late delivery</strong>. The “Run Scoring” page refreshes these
        predictions.
      </p>

      {error ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Failed to load priority queue: {error.message}
        </div>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-xs text-black">
            <tr>
              <th className="px-4 py-2 text-left">Order</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Order datetime</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-right">Late prob</th>
              <th className="px-4 py-2 text-right">Pred</th>
              <th className="px-4 py-2 text-left">Scored at</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.order_id} className="border-t">
                <td className="px-4 py-2 font-medium">#{r.order_id}</td>
                <td className="px-4 py-2">
                  {r.customer_name || `Customer #${r.customer_id}`}
                </td>
                <td className="px-4 py-2">
                  {formatOrderDatetime(r.order_datetime)}
                </td>
                <td className="px-4 py-2 text-right">
                  ${Number(r.order_total).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right">
                  {Number.isFinite(r.late_delivery_probability)
                    ? r.late_delivery_probability.toFixed(3)
                    : "—"}
                </td>
                <td className="px-4 py-2 text-right">
                  {r.predicted_late_delivery ? "Late" : "On time"}
                </td>
                <td className="px-4 py-2">{r.scored_at}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-black" colSpan={7}>
                  No predictions yet. Go to <code>/scoring</code> and click “Run
                  Scoring”.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

