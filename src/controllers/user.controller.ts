import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { validationResult } from "express-validator";
import { userRepository } from "../repositories/user.repository";

const userService = new UserService(userRepository);
export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      throw new Error("Please provide require fields");
    }
    const user = await userService.create(username, email, password, role);
    return res.status(201).json({
      message: "User created successfully",
      user: user,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;
    if (!id) {
      throw new Error("Please provide require field!");
    }
    const updateUser = await userService.update(
      parseInt(id),
      username,
      email,
      password,
      role
    );
    return res.status(200).json({
      message: "User updated successfully",
      updateUser,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error("Please provide require field");
    }
    const deletedUser = await userService.delete(parseInt(id));
    return res.status(201).json({
      message: "User deleted successfully",
      deletedUser,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function find(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { search } = req.query;
    const users = await userService.find(
      id ? parseInt(id) : undefined,
      search ? search.toString() : undefined
    );
    return res.json(users);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation error",
        errors: errors.array(),
      });
    }
    const { email, password } = req.body;
    const login = await userService.login(email, password);

    return res.status(200).json(login);
  } catch (error) {
    console.log(error);
    next(error);
  }
}
