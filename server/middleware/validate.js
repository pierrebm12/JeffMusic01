import { body, param, validationResult } from "express-validator";

export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: "Validation failed", details: errors.array() });
  }
  next();
}

export const showRules = [
  body("place").trim().notEmpty().isLength({ max: 255 }).withMessage("place is required (max 255 chars)"),
  body("day").trim().notEmpty().isLength({ max: 100 }).withMessage("day is required (max 100 chars)"),
  body("time").optional({ values: "falsy" }).trim().isLength({ max: 50 }).withMessage("time max 50 chars"),
  body("available").optional().isBoolean().withMessage("available must be boolean"),
];

export const mediaRules = [
  body("url").trim().notEmpty().isLength({ max: 500 }).withMessage("url is required (max 500 chars)"),
  body("title").trim().notEmpty().isLength({ max: 255 }).withMessage("title is required (max 255 chars)"),
  body("titleEn").optional({ values: "falsy" }).trim().isLength({ max: 255 }).withMessage("titleEn max 255 chars"),
  body("sortOrder").optional().isInt({ min: 0 }).withMessage("sortOrder must be a positive integer"),
];

export const partialShowRules = [
  body("place").optional({ values: "falsy" }).trim().isLength({ max: 255 }).withMessage("place max 255 chars"),
  body("day").optional({ values: "falsy" }).trim().isLength({ max: 100 }).withMessage("day max 100 chars"),
  body("time").optional({ values: "falsy" }).trim().isLength({ max: 50 }).withMessage("time max 50 chars"),
  body("available").optional().isBoolean().withMessage("available must be boolean"),
];

export const partialMediaRules = [
  body("url").optional({ values: "falsy" }).trim().isLength({ max: 500 }).withMessage("url max 500 chars"),
  body("title").optional({ values: "falsy" }).trim().isLength({ max: 255 }).withMessage("title max 255 chars"),
  body("titleEn").optional({ values: "falsy" }).trim().isLength({ max: 255 }).withMessage("titleEn max 255 chars"),
  body("sortOrder").optional().isInt({ min: 0 }).withMessage("sortOrder must be a positive integer"),
];

export const idRule = [
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
];

export const sectionRules = [
  body("mediaUrl").optional({ values: "falsy" }).trim().isLength({ max: 500 }).withMessage("mediaUrl max 500 chars"),
  body("mediaType").optional().isIn(["image", "video"]).withMessage("mediaType must be 'image' or 'video'"),
  body("titleEs").optional({ values: "falsy" }).trim().isLength({ max: 255 }).withMessage("titleEs max 255 chars"),
  body("titleEn").optional({ values: "falsy" }).trim().isLength({ max: 255 }).withMessage("titleEn max 255 chars"),
  body("subtitleEs").optional({ values: "falsy" }).trim().isLength({ max: 500 }).withMessage("subtitleEs max 500 chars"),
  body("subtitleEn").optional({ values: "falsy" }).trim().isLength({ max: 500 }).withMessage("subtitleEn max 500 chars"),
  body("text1Es").optional({ values: "falsy" }).trim().isLength({ max: 2000 }).withMessage("text1Es max 2000 chars"),
  body("text1En").optional({ values: "falsy" }).trim().isLength({ max: 2000 }).withMessage("text1En max 2000 chars"),
  body("text2Es").optional({ values: "falsy" }).trim().isLength({ max: 2000 }).withMessage("text2Es max 2000 chars"),
  body("text2En").optional({ values: "falsy" }).trim().isLength({ max: 2000 }).withMessage("text2En max 2000 chars"),
  body("text3Es").optional({ values: "falsy" }).trim().isLength({ max: 2000 }).withMessage("text3Es max 2000 chars"),
  body("text3En").optional({ values: "falsy" }).trim().isLength({ max: 2000 }).withMessage("text3En max 2000 chars"),
];

export const loginRules = [
  body("password").notEmpty().withMessage("password is required"),
];
