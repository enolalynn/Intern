import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

export const generateToken = (user: any): string => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    "123"
  );
  return token;
};

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: string };
      loginTime?: number;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, "123") as unknown as any;
    if (!decoded) {
      return res.status(401).json({ message: "Provided token is invalid" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    next();
  };
};
