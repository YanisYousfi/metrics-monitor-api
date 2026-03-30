import express, { Request, Response } from "express";
import pool from "./db";
import metricsRouter from "./routes/metrics";
import logger from "./middleware/logger";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(logger);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

pool
  .query("SELECT NOW()")
  .then((result) => {
    console.log("Database connected:", result.rows[0].now);
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });

app.use("/metrics", metricsRouter);
