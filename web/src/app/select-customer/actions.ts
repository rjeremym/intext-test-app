"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CUSTOMER_COOKIE } from "@/server/customerCookie";

export async function selectCustomerAction(formData: FormData) {
  const raw = formData.get("customer_id");
  const customerId = Number(raw);
  if (!Number.isFinite(customerId)) {
    redirect("/select-customer?error=invalid_customer");
  }

  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE, String(customerId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/dashboard");
}

