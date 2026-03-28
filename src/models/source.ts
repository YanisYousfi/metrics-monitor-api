import { z } from "zod";

export const sourceIdParamSchema = z.object({
  source_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type SourceIdParam = z.infer<typeof sourceIdParamSchema>;
