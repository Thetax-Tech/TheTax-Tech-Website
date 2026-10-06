import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "subscribers")) return new Response("Unauthorized", { status: 401 });
  const subs = await db.subscriber.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
  return new Response(toCsv(["Email", "Subscribed at"], subs.map((s) => [s.email, s.createdAt])), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="thetax-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
