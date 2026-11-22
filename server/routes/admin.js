import { Router } from "express";
import HelpRequest from "../models/Request.js";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();
router.use(protect, adminOnly);

router.get("/stats", async (req, res) => {
  const [users, requests, solved, open, flagged] = await Promise.all([
    User.countDocuments(),
    HelpRequest.countDocuments(),
    HelpRequest.countDocuments({ status: "solved" }),
    HelpRequest.countDocuments({ status: { $ne: "solved" } }),
    HelpRequest.countDocuments({ flagged: true }),
  ]);
  const byCategory = await HelpRequest.aggregate([
    { $group: { _id: "$category", value: { $sum: 1 } } },
    { $sort: { value: -1 } },
  ]);
  res.json({
    users,
    requests,
    solved,
    open,
    flagged,
    byCategory: byCategory.map((c) => ({ name: c._id, value: c.value })),
  });
});

router.get("/requests", async (req, res) => {
  res.json(
    await HelpRequest.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("author", "name email"),
  );
});

router.put("/requests/:id/flag", async (req, res) => {
  const r = await HelpRequest.findById(req.params.id);
  if (!r) return res.status(404).json({ message: "Not found" });
  r.flagged = !r.flagged;
  await r.save();
  res.json(r);
});

router.delete("/requests/:id", async (req, res) => {
  await HelpRequest.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
