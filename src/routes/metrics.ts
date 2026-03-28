import { Router, Request, Response } from "express";
import pool from "../db.js";
import { z } from "zod";
import { metricTypeEnum } from "../models/common.js";
import { sourceIdParamSchema } from "../models/source.js";

const router = Router();

const metricPayloadSchema = z.object({
  source_id: z.number(),
  metric_type: metricTypeEnum,
  value: z.number().nonnegative(),
  timestamp: z.string().optional(),
});

const getStatsParamsSchema = z.object({
  source_id: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .optional(),
  metric_type: metricTypeEnum.optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

const getMetricsQuerySchema = z.object({
  metric_type: metricTypeEnum.optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { source_id, metric_type, value, timestamp } =
      metricPayloadSchema.parse(req.body);

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
    if (err instanceof z.ZodError) {
      res.status(400).json({ errors: err.issues });
      return;
    }
    console.error("Error inserting metric:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const { source_id, metric_type, date_from, date_to } =
      getStatsParamsSchema.parse(req.query);

    let query: string = `SELECT AVG(value) as avg_value,
         MIN(value) as min_value,
         MAX(value) as max_value,
         COUNT(*) as count,
         PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95_value
         FROM metrics
         WHERE 1=1`;

    let params: (string | number)[] = [];
    let paramIndex = 1;

    if (source_id) {
      query += ` AND source_id = $${paramIndex}`;
      params.push(source_id);
      paramIndex++;
    }

    if (metric_type) {
      query += ` AND metric_type = $${paramIndex}`;
      params.push(metric_type);
      paramIndex++;
    }

    if (date_from) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(date_to);
      paramIndex++;
    }

    const result = await pool.query(query, params);

    res.status(200).json(result.rows);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ errors: err.issues });
      return;
    }
    console.error("Error fetching metrics:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:source_id", async (req: Request, res: Response) => {
  try {
    const { source_id } = sourceIdParamSchema.parse(req.params);
    const { metric_type, date_from, date_to } = getMetricsQuerySchema.parse(
      req.query,
    );

    let query: string = "SELECT * FROM metrics WHERE source_id = $1";
    let params: (string | number)[] = [source_id];
    let paramIndex = 2;

    if (metric_type) {
      query += ` AND metric_type = $${paramIndex}`;
      params.push(metric_type);
      paramIndex++;
    }

    if (date_from) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(date_to);
      paramIndex++;
    }

    const result = await pool.query(query, params);

    res.status(200).json(result.rows);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ errors: err.issues });
      return;
    }
    console.error("Error fetching metrics:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
