import { redirect } from "next/navigation";
import { getSelectedCustomerId } from "@/server/customerCookie";
import { supabaseAdmin } from "@/server/supabaseAdmin";
import PlaceOrderForm from "./placeOrderForm";

export const dynamic = "force-dynamic";

export default async function PlaceOrderPage() {
  const customerId = await getSelectedCustomerId();
  if (!customerId) redirect("/select-customer");

  const sb = supabaseAdmin();
  const [{ data: customer }, { data: products, error: productsError }] =
    await Promise.all([
      sb
        .from("customers")
        .select("customer_id, full_name, email")
        .eq("customer_id", customerId)
        .maybeSingle(),
      sb
        .from("products")
        .select("product_id, product_name, price, is_active")
        .order("product_name", { ascending: true })
        .limit(1000),
    ]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Place Order</h1>
      <p className="mt-1 text-sm text-black">
        Creating an order inserts into <code>orders</code> +{" "}
        <code>order_items</code>.
      </p>

      <div className="mt-4 rounded-lg border bg-white p-4 text-sm">
        <div className="text-xs text-black">Selected customer</div>
        <div className="mt-1 font-medium text-black">
          {customer ? customer.full_name : `Customer #${customerId}`}
        </div>
        <div className="mt-1 text-xs text-black">{customer?.email ?? "—"}</div>
      </div>

      {productsError ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Failed to load products: {productsError.message}
        </div>
      ) : null}

      <div className="mt-6">
        <PlaceOrderForm
          customerId={customerId}
          products={(products ?? []).filter((p) => p.is_active)}
        />
      </div>
    </div>
  );
}

