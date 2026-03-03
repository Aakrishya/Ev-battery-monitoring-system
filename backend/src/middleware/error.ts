import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/api-error.js";

export function notFound(_req: Request, res: Response) {
  return res.status(StatusCodes.NOT_FOUND).json({ message: "Route not found" });
}

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error(error);
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Unexpected server error" });
}
