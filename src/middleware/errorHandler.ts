import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof z.ZodError) {
    res.status(400).json({ errors: err.issues });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};

export default errorHandler;
