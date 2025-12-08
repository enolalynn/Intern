import { Router } from "express";
import {
  createUser,
  deleteUser,
  find,
  login,
  updateUser,
} from "../controllers/user.controller";
import { authenticate, authorize } from "../middleware/auth";
const userRouter = Router();

userRouter.post("/", createUser);
userRouter.put("/user/:id", authenticate, authorize(["admin"]), updateUser);
userRouter.delete("/user/:id", authenticate, authorize(["admin"]), deleteUser);
userRouter.get("/user/:id", authenticate, authorize(["user", "admin"]), find);
userRouter.get("/users", find);
userRouter.post("/user/login", login);
export default userRouter;
