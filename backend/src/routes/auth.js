import { Router } from "express";

const router = Router();

router.get("/me", (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      appMetadata: req.user.app_metadata
    }
  });
});

export default router;
