import createError from "http-errors";
import { supabasePublic } from "../lib/supabase.js";

export async function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createError(401, "Missing bearer token");
    }

    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) {
      throw createError(401, "Missing bearer token");
    }

    const { data, error } = await supabasePublic.auth.getUser(token);

    if (error || !data?.user) {
      throw createError(401, "Invalid or expired token");
    }

    req.user = data.user;
    req.accessToken = token;
    next();
  } catch (error) {
    next(error);
  }
}
