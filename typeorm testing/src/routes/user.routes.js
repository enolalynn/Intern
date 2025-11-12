import { Router } from "express";
const userRouter = Router();
import {
  createUser,
  deleteUser,
  find,
  updateUser,
} from "../controllers/user.controller.js";

userRouter.get("/", find);
userRouter.get("/:id", find);
userRouter.post("/", createUser);
userRouter.delete("/:id", deleteUser);
userRouter.patch("/:id", updateUser);

export default userRouter;
