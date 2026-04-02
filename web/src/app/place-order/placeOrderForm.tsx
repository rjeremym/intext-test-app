"use client";

import { useMemo, useState } from "react";
import { createOrderAction } from "./serverActions";

type Product = {
  product_id: number;
  product_name: string;
  price: number;
};

type Line = { product_id: number; quantity: number };

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

export default function PlaceOrderForm({
  customerId,
  products,
}: {
  customerId: number;
  products: Product[];
}) {
  const [lines, setLines] = useState<Line[]>([
    { product_id: products[0]?.product_id ?? 0, quantity: 1 },
  ]);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [deviceType, setDeviceType] = useState("desktop");
  const [ipCountry, setIpCountry] = useState("US");
  const [shippingState, setShippingState] = useState("");
  const [promoUsed, setPromoUsed] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  const priceById = useMemo(() => {
    return new Map(products.map((p) => [p.product_id, p.price] as const));
  }, [products]);

  const subtotal = useMemo(() => {
    return lines.reduce((sum, l) => {
      const price = priceById.get(l.product_id) ?? 0;
      return sum + price * l.quantity;
    }, 0);
  }, [lines, priceById]);

  const shippingFee = useMemo(() => (subtotal >= 50 ? 0 : 6.99), [subtotal]);
  const taxAmount = useMemo(() => subtotal * 0.06, [subtotal]);
  const total = useMemo(() => subtotal + shippingFee + taxAmount, [
    subtotal,
    shippingFee,
    taxAmount,
  ]);

  function updateLine(idx: number, patch: Partial<Line>) {
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)),
    );
  }

  function addLine() {
    const fallback = products[0]?.product_id ?? 0;
    setLines((prev) => [...prev, { product_id: fallback, quantity: 1 }]);
  }

  function removeLine(idx: number) {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  const canSubmit = customerId > 0 && lines.length > 0 && lines.every((l) => l.quantity > 0);

  return (
    <form
      className="rounded-lg border bg-white p-4 text-black"
      action={async () => {
        const cleaned = lines
          .map((l) => ({
            product_id: Number(l.product_id),
            quantity: clampInt(Number(l.quantity), 1, 99),
          }))
          .filter((l) => Number.isFinite(l.product_id) && l.product_id > 0);

        await createOrderAction({
          customerId,
          lines: cleaned,
          paymentMethod,
          deviceType,
          ipCountry,
          shippingState: shippingState || null,
          promoUsed,
          promoCode: promoUsed ? promoCode || null : null,
        });
      }}
    >
      <div className="text-sm font-medium text-black">Line items</div>
      <div className="mt-3 space-y-3">
        {lines.map((l, idx) => (
          <div key={idx} className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-8">
              <label className="block text-xs text-black">Product</label>
              <select
                className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm"
                value={l.product_id}
                onChange={(e) =>
                  updateLine(idx, { product_id: Number(e.target.value) })
                }
              >
                {products.map((p) => (
                  <option key={p.product_id} value={p.product_id}>
                    {p.product_name} (${Number(p.price).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-black">Quantity</label>
              <input
                className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm"
                type="number"
                min={1}
                max={99}
                value={l.quantity}
                onChange={(e) =>
                  updateLine(idx, { quantity: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex items-end md:col-span-2">
              <button
                type="button"
                className="w-full rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
                onClick={() => removeLine(idx)}
                disabled={lines.length <= 1}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-50"
          onClick={addLine}
        >
          Add item
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-md border bg-zinc-50 p-3 text-black">
          <div className="text-xs font-medium text-black">Checkout inputs</div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-black">Payment method</label>
              <select
                className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="card">card</option>
                <option value="paypal">paypal</option>
                <option value="bank">bank</option>
                <option value="crypto">crypto</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-black">Device type</label>
              <select
                className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm"
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
              >
                <option value="desktop">desktop</option>
                <option value="mobile">mobile</option>
                <option value="tablet">tablet</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-black">IP country</label>
              <input
                className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm"
                value={ipCountry}
                onChange={(e) => setIpCountry(e.target.value)}
                placeholder="US"
              />
            </div>
            <div>
              <label className="block text-xs text-black">Shipping state</label>
              <input
                className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm"
                value={shippingState}
                onChange={(e) => setShippingState(e.target.value)}
                placeholder="UT"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-xs text-black">
                <input
                  type="checkbox"
                  checked={promoUsed}
                  onChange={(e) => setPromoUsed(e.target.checked)}
                />
                Promo used
              </label>
              {promoUsed ? (
                <input
                  className="mt-2 w-full rounded-md border bg-white px-3 py-2 text-sm"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="PROMO10"
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-md border bg-zinc-50 p-3 text-black">
          <div className="text-xs font-medium text-black">Computed totals</div>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-black">Subtotal</dt>
              <dd className="font-medium">${subtotal.toFixed(2)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-black">Shipping fee</dt>
              <dd className="font-medium">${shippingFee.toFixed(2)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-black">Tax</dt>
              <dd className="font-medium">${taxAmount.toFixed(2)}</dd>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <dt className="text-black">Total</dt>
              <dd className="font-semibold">${total.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          disabled={!canSubmit}
        >
          Create order
        </button>
      </div>
    </form>
  );
}

