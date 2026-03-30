import { z } from "zod";

export const DateRangeSchema = z.object({
  date_from: z.iso.datetime().optional(),
  date_to: z.iso.datetime().optional(),
});

export const metricTypeEnum = z.enum([
  "response_time",
  "error_rate",
  "memory_usage",
]);

export interface ErrorResponse {
  error?: string;
  errors?: z.core.$ZodIssue[];
}
