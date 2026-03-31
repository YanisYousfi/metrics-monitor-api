import z from "zod";

export const metricTypeEnum = z.enum([
  "response_time",
  "error_rate",
  "memory_usage",
]);

export interface Metric {
  source_id: number;
  metric_type: string;
  value: number;
  created_at: string;
}

export interface MetricStats {
  avg_value: number;
  min_value: number;
  max_value: number;
  count: number;
  p95_value: number;
}

export interface Anomaly {
  source_id: number;
  metric_type: string;
  value: number;
  moving_avg: number;
  moving_stddev: number;
  created_at: string;
}

export const metricPayloadSchema = z.object({
  source_id: z.number().int().positive(),
  metric_type: metricTypeEnum,
  value: z.number().nonnegative(),
  timestamp: z.string().optional(),
});
