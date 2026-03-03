import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../config/prisma.js";
import { signToken } from "../../utils/jwt.js";
import { ApiError } from "../../utils/api-error.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });

    if (existing) {
      throw new ApiError(StatusCodes.CONFLICT, "Email already registered");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: "OPERATOR"
      }
    });

    const token = signToken({ userId: user.id, role: user.role, email: user.email });

    return res.status(StatusCodes.CREATED).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    }

    const validPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!validPassword) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    }

    const token = signToken({ userId: user.id, role: user.role, email: user.email });

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
});
