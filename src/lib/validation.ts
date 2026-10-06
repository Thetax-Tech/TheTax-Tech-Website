import { z } from "zod";

const phone = z
  .string()
  .trim()
  .max(30)
  .regex(/^[+\d\s()-]*$/, "Use digits, spaces and + only")
  .optional()
  .or(z.literal(""));

export const contactSchema = z.object({
  type: z.literal("CONTACT"),
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.email("Please enter a valid email").max(160),
  phone,
  company: z.string().trim().max(120).optional().or(z.literal("")),
  subject: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(5000),
  website: z.string().max(0).optional().or(z.literal("")), // honeypot
  sourceUrl: z.string().max(500).optional(),
  consent: z.literal(true, { error: "Please accept the privacy policy" }),
});

export const quoteSchema = contactSchema.extend({
  type: z.literal("QUOTE"),
  service: z.string().trim().min(1, "Please choose a service").max(120),
  budget: z.string().trim().max(60).optional().or(z.literal("")),
  timeline: z.string().trim().max(60).optional().or(z.literal("")),
});

export const careerSchema = contactSchema.extend({
  type: z.literal("CAREER"),
  subject: z.string().trim().min(1).max(160), // job title
});

export const leadSchema = z.discriminatedUnion("type", [contactSchema, quoteSchema, careerSchema]);
export type LeadInput = z.infer<typeof leadSchema>;

export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
