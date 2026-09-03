import { ZodError } from "zod";
import { logger } from "../utils/logger.js";

export const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      logger.warn({ issues: err.issues }, "Validation failed");
      return res.status(400).json({
        error: "Validation Error",
        details: err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
    next(err);
  }
};
