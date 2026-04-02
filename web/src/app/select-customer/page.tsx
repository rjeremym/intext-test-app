import { supabaseAdmin } from "@/server/supabaseAdmin";
import { selectCustomerAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SelectCustomerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = sp.error;

  const sb = supabaseAdmin();
  const { data: customers, error: customersError } = await sb
    .from("customers")
    .select("customer_id, full_name, email")
    .order("customer_id", { ascending: true })
    .limit(500);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Select Customer</h1>
      <p className="mt-2 text-sm text-black">
        This demo has no authentication. Select a customer to “act as” for the
        session.
      </p>

      {error ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Could not select customer ({String(error)}).
        </div>
      ) : null}

      {customersError ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Failed to load customers: {customersError.message}
        </div>
      ) : null}

      <form action={selectCustomerAction} className="mt-6">
        <label className="block text-sm font-medium text-black">
          Customer
        </label>
        <select
          name="customer_id"
          className="mt-2 w-full max-w-xl rounded-md border bg-white px-3 py-2 text-sm"
          required
          defaultValue=""
        >
          <option value="" disabled>
            Choose…
          </option>
          {(customers ?? []).map((c) => (
            <option key={c.customer_id} value={c.customer_id}>
              {c.full_name} ({c.email})
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="mt-4 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Continue
        </button>
      </form>

      <div className="mt-10 rounded-lg border bg-white p-4">
        <div className="text-sm font-medium text-black">Troubleshooting</div>
        <ul className="mt-2 list-disc pl-5 text-sm text-black">
          <li>
            Ensure env vars are set: <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code>.
          </li>
          <li>
            Ensure your Supabase DB has been migrated and seeded (customers
            table has rows).
          </li>
        </ul>
      </div>
    </div>
  );
}

