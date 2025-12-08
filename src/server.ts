import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import { json } from "body-parser";
import { authenticate, authorize, generateToken } from "./middleware/auth";
import { AppDataSource } from "./config/database";
import { User } from "./model/user";
import { userRepository } from "./repositories/user.repository";
import userRouter from "./routes/user.routes";

// Initialize Express app
const app = express();
const PORT = 5001;

// Middleware
app.use(json());
app.use("/api", userRouter);

// app.get("/api/users", async (req, res) => {
//   const users = await userRepository.find({});
//   return res.json(users);
// });

// app.get("/api/user", authenticate, authorize(["user", "admin"]), (req, res) => {
//   res.json({ message: `Hello user ${req.user?.id}` });
// });

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message);
  res.status(500).json({ message: "Something went wrong!" });
});

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("DB init error", err);
    process.exit(1);
  });
