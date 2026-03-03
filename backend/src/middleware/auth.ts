import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { verifyToken } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: "ADMIN" | "OPERATOR";
        email: string;
      };
    }
  }
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Missing access token" });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "Admin access required" });
  }
  next();
}
