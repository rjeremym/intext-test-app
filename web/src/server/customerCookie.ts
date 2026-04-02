import { cookies } from "next/headers";

export const CUSTOMER_COOKIE = "customer_id";

export async function getSelectedCustomerId(): Promise<number | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CUSTOMER_COOKIE)?.value;
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

