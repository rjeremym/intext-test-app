"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/server/supabaseAdmin";
import { round2 } from "@/server/money";

type CreateOrderInput = {
  customerId: number;
  lines: { product_id: number; quantity: number }[];
  paymentMethod: string;
  deviceType: string;
  ipCountry: string;
  shippingState: string | null;
  promoUsed: boolean;
  promoCode: string | null;
};

function nowIso() {
  return new Date().toISOString();
}

export async function createOrderAction(input: CreateOrderInput) {
  if (!Number.isFinite(input.customerId) || input.customerId <= 0) {
    redirect("/select-customer?error=missing_customer");
  }
  if (!input.lines?.length) {
    redirect("/place-order?error=no_lines");
  }

  const sb = supabaseAdmin();

  // Load product prices for selected items.
  const productIds = Array.from(new Set(input.lines.map((l) => l.product_id)));
  const { data: products, error: productsError } = await sb
    .from("products")
    .select("product_id, price, is_active")
    .in("product_id", productIds);

  if (productsError) {
    redirect(`/place-order?error=products_${encodeURIComponent(productsError.message)}`);
  }

  const priceById = new Map(
    (products ?? []).map((p) => [p.product_id, Number(p.price)] as const),
  );

  const normalizedLines = input.lines
    .map((l) => ({
      product_id: Number(l.product_id),
      quantity: Math.max(1, Math.min(99, Math.trunc(Number(l.quantity)))),
    }))
    .filter((l) => priceById.has(l.product_id));

  if (normalizedLines.length === 0) {
    redirect("/place-order?error=invalid_lines");
  }

  const subtotal = round2(
    normalizedLines.reduce((sum, l) => sum + (priceById.get(l.product_id) ?? 0) * l.quantity, 0),
  );
  const shippingFee = round2(subtotal >= 50 ? 0 : 6.99);
  const taxAmount = round2(subtotal * 0.06);
  const orderTotal = round2(subtotal + shippingFee + taxAmount);

  // risk_score is required by schema. For demo we set a deterministic-ish value derived from cart.
  const riskScore = round2(Math.min(100, Math.max(0, 10 + (orderTotal / 200) * 30)));

  const { data: insertedOrders, error: orderError } = await sb
    .from("orders")
    .insert({
      customer_id: input.customerId,
      order_datetime: nowIso(),
      billing_zip: null,
      shipping_zip: null,
      shipping_state: input.shippingState,
      payment_method: input.paymentMethod,
      device_type: input.deviceType,
      ip_country: input.ipCountry,
      promo_used: input.promoUsed ? 1 : 0,
      promo_code: input.promoCode,
      order_subtotal: subtotal,
      shipping_fee: shippingFee,
      tax_amount: taxAmount,
      order_total: orderTotal,
      risk_score: riskScore,
      is_fraud: 0,
    })
    .select("order_id")
    .limit(1);

  if (orderError || !insertedOrders?.[0]?.order_id) {
    redirect(`/place-order?error=order_insert`);
  }

  const orderId = insertedOrders[0].order_id as number;

  const itemsPayload = normalizedLines.map((l) => {
    const unitPrice = priceById.get(l.product_id) ?? 0;
    const lineTotal = round2(unitPrice * l.quantity);
    return {
      order_id: orderId,
      product_id: l.product_id,
      quantity: l.quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
    };
  });

  const { error: itemsError } = await sb.from("order_items").insert(itemsPayload);
  if (itemsError) {
    // Not truly transactional without RPC; acceptable for demo. Surface error.
    redirect(`/orders?error=items_insert_${encodeURIComponent(itemsError.message)}`);
  }

  redirect("/orders?created=1");
}

