import { ZodError } from "zod";

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: "Invalid request payload",
        details: err.flatten()
      }
    });
  }

  const status = err.status || 500;
  const message = err.message || "Internal server error";

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    error: {
      message
    }
  });
}
