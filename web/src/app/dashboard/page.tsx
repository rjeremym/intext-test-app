import { redirect } from "next/navigation";
import { getSelectedCustomerId } from "@/server/customerCookie";
import { supabaseAdmin } from "@/server/supabaseAdmin";

export const dynamic = "force-dynamic";

type DashboardAggRow = { total_orders: number; total_spend: number };

export default async function DashboardPage() {
  const customerId = await getSelectedCustomerId();
  if (!customerId) redirect("/select-customer");

  const sb = supabaseAdmin();

  const [{ data: customer }, { data: orders }, { data: agg }] = await Promise.all(
    [
      sb
        .from("customers")
        .select("customer_id, full_name, email")
        .eq("customer_id", customerId)
        .maybeSingle(),
      sb
        .from("orders")
        .select("order_id, order_datetime, order_total, is_fraud")
        .eq("customer_id", customerId)
        .order("order_datetime", { ascending: false })
        .limit(5),
      sb.rpc("dashboard_customer_agg", { p_customer_id: customerId }),
    ],
  );

  // Fallback if RPC not installed yet (during early setup)
  const aggRow = (Array.isArray(agg) ? agg[0] : agg) as DashboardAggRow | null;
  const totalOrders = aggRow?.total_orders ?? null;
  const totalSpend = aggRow?.total_spend ?? null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Customer Dashboard</h1>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs text-black">Selected customer</div>
          <div className="mt-1 text-sm font-medium text-black">
            {customer ? customer.full_name : `Customer #${customerId}`}
          </div>
          <div className="mt-1 text-xs text-black">
            {customer?.email ?? "—"}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs text-black">Total orders</div>
          <div className="mt-1 text-2xl font-semibold text-black">
            {totalOrders ?? "—"}
          </div>
          <div className="mt-1 text-xs text-black">
            If blank, apply migrations for the dashboard RPC.
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs text-black">Total spend</div>
          <div className="mt-1 text-2xl font-semibold text-black">
            {typeof totalSpend === "number"
              ? `$${totalSpend.toFixed(2)}`
              : "—"}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border bg-white">
        <div className="border-b px-4 py-3 text-sm font-medium text-black">
          Recent orders
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-xs text-black">
              <tr>
                <th className="px-4 py-2 text-left">Order</th>
                <th className="px-4 py-2 text-left">Order datetime</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-right">Fraud</th>
              </tr>
            </thead>
            <tbody>
              {(orders ?? []).map((o) => (
                <tr key={o.order_id} className="border-t">
                  <td className="px-4 py-2 font-medium">#{o.order_id}</td>
                  <td className="px-4 py-2">{o.order_datetime}</td>
                  <td className="px-4 py-2 text-right">
                    ${Number(o.order_total).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {o.is_fraud ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
              {(orders ?? []).length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-black" colSpan={4}>
                    No orders found for this customer.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

