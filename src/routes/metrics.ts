import { Router, Request, Response } from "express";
import pool from "../db.js";

const router = Router();

interface MetricPayload {
  source_id: number;
  metric_type: "response_time" | "error_rate" | "memory_usage";
  value: number;
  timestamp?: string;
}

router.post("/", async (req: Request, res: Response) => {
  const { source_id, metric_type, value, timestamp }: MetricPayload = req.body;

  // Validation
  if (!source_id || !metric_type || value === undefined) {
    res.status(400).json({
      error: "Missing required fields: source_id, metric_type, value",
    });
    return;
  }

  const validTypes = ["response_time", "error_rate", "memory_usage"];
  if (!validTypes.includes(metric_type)) {
    res.status(400).json({
      error: `Invalid metric_type. Must be one of: ${validTypes.join(", ")}`,
    });
    return;
  }

  if (typeof value !== "number" || value < 0) {
    res.status(400).json({ error: "Value must be a non-negative number" });
    return;
  }

  try {
    // Check if source exists
    const sourceCheck = await pool.query(
      "SELECT id FROM sources WHERE id = $1",
      [source_id],
    );

    if (sourceCheck.rows.length === 0) {
      res.status(404).json({ error: `Source with id ${source_id} not found` });
      return;
    }

    // Insert the metric
    const result = await pool.query(
      `INSERT INTO metrics (source_id, metric_type, value, created_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [source_id, metric_type, value, timestamp || new Date().toISOString()],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting metric:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
