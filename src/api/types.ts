import z from "zod";

export const SageRequestSchema = z.object({
    partnerName: z.string(),
    initialKeywords: z.array(z.string()),
});

export type SageRequest = z.infer<typeof SageRequestSchema>;