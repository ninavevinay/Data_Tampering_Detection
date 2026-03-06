import { Router } from "express";
import { z } from "zod";
import { createRecord, listRecords, verifyRecord } from "../services/records.js";

const router = Router();

const createSchema = z.object({
  label: z.string().trim().min(2).max(120),
  data: z.unknown(),
  metadata: z.record(z.unknown()).optional()
});

const verifySchema = z.object({
  recordId: z.string().uuid(),
  data: z.unknown()
});

router.get("/", async (req, res, next) => {
  try {
    const records = await listRecords(req.user.id);
    res.json({ records });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const payload = createSchema.parse(req.body);
    const record = await createRecord({
      userId: req.user.id,
      ...payload
    });

    res.status(201).json({
      message: "Hash stored successfully",
      record
    });
  } catch (error) {
    next(error);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const payload = verifySchema.parse(req.body);
    const result = await verifyRecord({
      userId: req.user.id,
      ...payload
    });

    res.json({
      message: result.tampered ? "Tampering detected" : "Data integrity intact",
      result
    });
  } catch (error) {
    next(error);
  }
});

export default router;
