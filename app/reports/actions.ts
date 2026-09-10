"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export async function setShowAllReports(formData: FormData) {
  const view = formData.get("reportsView");

  const cookieStore = await cookies();

  cookieStore.set("reports_view", String(view), {
    path: "/reports",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect("/reports");
}
