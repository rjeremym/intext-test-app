import Link from "next/link";
import { redirect } from "next/navigation";
import { formatOrderDatetime } from "@/lib/formatOrderDatetime";
import { getSelectedCustomerId } from "@/server/customerCookie";
import { supabaseAdmin } from "@/server/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const customerId = await getSelectedCustomerId();
  if (!customerId) redirect("/select-customer");

  const sb = supabaseAdmin();

  const [{ data: customer }, { data: orders, error }] = await Promise.all([
    sb
      .from("customers")
      .select("customer_id, full_name, email")
      .eq("customer_id", customerId)
      .maybeSingle(),
    sb
      .from("orders")
      .select("order_id, order_datetime, order_total, payment_method, device_type")
      .eq("customer_id", customerId)
      .order("order_datetime", { ascending: false })
      .limit(200),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Order History</h1>
          <div className="mt-1 text-sm text-black">
            {customer ? (
              <>
                {customer.full_name} · {customer.email}
              </>
            ) : (
              <>Customer #{customerId}</>
            )}
          </div>
        </div>
        <Link
          href="/place-order"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Place new order
        </Link>
      </div>

      {error ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Failed to load orders: {error.message}
        </div>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-xs text-black">
            <tr>
              <th className="px-4 py-2 text-left">Order</th>
              <th className="px-4 py-2 text-left">Order datetime</th>
              <th className="px-4 py-2 text-left">Payment</th>
              <th className="px-4 py-2 text-left">Device</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.order_id} className="border-t">
                <td className="px-4 py-2 font-medium">
                  <Link
                    href={`/orders/${o.order_id}`}
                    className="hover:underline"
                  >
                    #{o.order_id}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  {formatOrderDatetime(o.order_datetime)}
                </td>
                <td className="px-4 py-2">{o.payment_method}</td>
                <td className="px-4 py-2">{o.device_type}</td>
                <td className="px-4 py-2 text-right">
                  ${Number(o.order_total).toFixed(2)}
                </td>
              </tr>
            ))}
            {(orders ?? []).length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-black" colSpan={5}>
                  No orders found yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

