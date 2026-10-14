import type { Request, Response, NextFunction } from "express";
import { normalizePhone, PHONE_ERROR } from "@shared/phone";

/** Runs before persistence, notification and webhook forwarding, including old clients. */
export function normalizeLeadPhone(req: Request, res: Response, next: NextFunction) {
  const phone = req.body?.phone;
  // Preserve email-only partial capture and legacy optional-phone API callers.
  if (phone === undefined || phone === null || phone === "") return next();
  try {
    req.body.phone = normalizePhone(phone);
    return next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      field: "phone",
      message: error instanceof Error ? error.message : PHONE_ERROR,
    });
  }
}
