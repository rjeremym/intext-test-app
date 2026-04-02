import Link from "next/link";
import { formatOrderDatetime } from "@/lib/formatOrderDatetime";
import { supabaseAdmin } from "@/server/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  const { order_id } = await params;
  const orderId = Number(order_id);

  const sb = supabaseAdmin();

  const { data: order, error: orderError } = await sb
    .from("orders")
    .select(
      "order_id, customer_id, order_datetime, order_total, order_subtotal, shipping_fee, tax_amount, payment_method, device_type, ip_country, promo_used, promo_code",
    )
    .eq("order_id", orderId)
    .maybeSingle();

  const { data: items, error: itemsError } = await sb
    .from("order_items")
    .select("order_item_id, product_id, quantity, unit_price, line_total")
    .eq("order_id", orderId)
    .order("order_item_id", { ascending: true });

  const productIds = Array.from(new Set((items ?? []).map((i) => i.product_id)));
  const { data: products } =
    productIds.length > 0
      ? await sb
          .from("products")
          .select("product_id, product_name")
          .in("product_id", productIds)
      : { data: [] as { product_id: number; product_name: string }[] };

  const productNameById = new Map(
    (products ?? []).map((p) => [p.product_id, p.product_name] as const),
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Order #{Number.isFinite(orderId) ? orderId : order_id}
          </h1>
          <div className="mt-1 text-sm text-black">
            <Link href="/orders" className="hover:underline">
              ← Back to orders
            </Link>
          </div>
        </div>
      </div>

      {orderError ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Failed to load order: {orderError.message}
        </div>
      ) : null}

      {itemsError ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Failed to load line items: {itemsError.message}
        </div>
      ) : null}

      {order ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-4 md:col-span-2">
            <div className="text-sm font-medium text-black">Summary</div>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-black">Order datetime</dt>
                <dd className="mt-1 font-medium">
                  {formatOrderDatetime(order.order_datetime)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-black">Total</dt>
                <dd className="mt-1 font-medium">
                  ${Number(order.order_total).toFixed(2)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-black">Payment method</dt>
                <dd className="mt-1 font-medium">{order.payment_method}</dd>
              </div>
              <div>
                <dt className="text-xs text-black">Device</dt>
                <dd className="mt-1 font-medium">{order.device_type}</dd>
              </div>
              <div>
                <dt className="text-xs text-black">IP country</dt>
                <dd className="mt-1 font-medium">{order.ip_country}</dd>
              </div>
              <div>
                <dt className="text-xs text-black">Promo</dt>
                <dd className="mt-1 font-medium">
                  {order.promo_used ? "Yes" : "No"}
                  {order.promo_code ? ` (${order.promo_code})` : ""}
                </dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm font-medium text-black">Totals</div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-black">Subtotal</dt>
                <dd className="font-medium">
                  ${Number(order.order_subtotal).toFixed(2)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-black">Shipping</dt>
                <dd className="font-medium">
                  ${Number(order.shipping_fee).toFixed(2)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-black">Tax</dt>
                <dd className="font-medium">
                  ${Number(order.tax_amount).toFixed(2)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <dt className="text-black">Total</dt>
                <dd className="font-semibold">
                  ${Number(order.order_total).toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-md border bg-white p-4 text-sm text-black">
          Order not found.
        </div>
      )}

      <div className="mt-8 overflow-x-auto rounded-lg border bg-white">
        <div className="border-b px-4 py-3 text-sm font-medium text-black">
          Line items
        </div>
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-xs text-black">
            <tr>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-right">Qty</th>
              <th className="px-4 py-2 text-right">Unit price</th>
              <th className="px-4 py-2 text-right">Line total</th>
            </tr>
          </thead>
          <tbody>
            {(items ?? []).map((i) => (
              <tr key={i.order_item_id} className="border-t">
                <td className="px-4 py-2">
                  {productNameById.get(i.product_id) ?? `#${i.product_id}`}
                </td>
                <td className="px-4 py-2 text-right">{i.quantity}</td>
                <td className="px-4 py-2 text-right">
                  ${Number(i.unit_price).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right">
                  ${Number(i.line_total).toFixed(2)}
                </td>
              </tr>
            ))}
            {(items ?? []).length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-black" colSpan={4}>
                  No line items found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

