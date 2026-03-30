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
