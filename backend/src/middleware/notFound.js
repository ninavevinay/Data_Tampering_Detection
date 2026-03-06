import createError from "http-errors";

export function notFound(_req, _res, next) {
  next(createError(404, "Route not found"));
}
