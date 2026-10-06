import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { leadWhere } from "@/lib/leads";
import { toCsv } from "@/lib/csv";

/** CSV export of leads, honouring the current inbox filters. */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "leads")) return new Response("Unauthorized", { status: 401 });
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const leads = await db.lead.findMany({ where: leadWhere(sp), orderBy: { createdAt: "desc" } });
  const csv = toCsv(
    ["Date", "Type", "Status", "Name", "Email", "Phone", "Company", "Service", "Budget", "Timeline", "Subject", "Message", "Notes", "Page"],
    leads.map((l) => [l.createdAt.toISOString(), l.type, l.status, l.name, l.email, l.phone, l.company, l.service, l.budget, l.timeline, l.subject, l.message, l.notes, l.sourceUrl]),
  );
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="thetax-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
