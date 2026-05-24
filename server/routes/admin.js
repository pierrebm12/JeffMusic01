import { Router } from "express";
import { loginRules, handleValidation } from "../middleware/validate.js";

const router = Router();

router.post("/login", loginRules, handleValidation, (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || "jeff2024";

  if (password === adminPassword) {
    res.json({ success: true, message: "Login successful" });
  } else {
    res.status(401).json({ success: false, message: "Invalid password" });
  }
});

router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logout successful" });
});

export default router;
