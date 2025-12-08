import { ILike, Repository } from "typeorm";

import jwt from "jsonwebtoken";
import { User } from "../model/user.ts";
import { userRepository } from "../repositories/user.repository.ts";
type loginUser = { user: User; token: string };
interface IUserService {
  create: (
    username: string,
    email: string,
    password: string,
    role: string
  ) => Promise<User>;

  update: (
    id: number,
    username: string,
    email: string,
    password: string,
    role: string
  ) => Promise<User>;

  delete: (id: number) => void;
  find: (id?: number, search?: string) => Promise<User | User[] | null>;
  login: (email: string, password: string) => Promise<loginUser>;
}

export class UserService implements IUserService {
  constructor(private userRepository: Repository<User>) {}
  async create(
    username: string,
    email: string,
    password: string,
    role: string
  ) {
    const exist = await this.userRepository.findOneBy({ email: email });
    if (exist) {
      throw new Error("Email is already exist");
    }
    const user = this.userRepository.create({
      username,
      email,
      password,
      role,
    });
    return await this.userRepository.save(user);
  }

  async update(
    id: number,
    username: string,
    email: string,
    password: string,
    role: string
  ): Promise<User> {
    await this.userRepository.update(
      { id: id },
      { username: username, email: email, password: password, role: role }
    );
    const exist = await this.userRepository.findOneBy({ id: id });

    if (!exist) {
      throw new Error("User not found");
    }

    return exist;
  }

  async delete(id: number) {
    const exist = await this.userRepository.findOneBy({ id: id });
    if (!exist) {
      throw new Error("User not found!");
    }
    const deleted = await this.userRepository.delete({ id: id });
    return deleted;
  }

  async find(id?: number, search?: string): Promise<User | User[] | null> {
    if (id) {
      return this.userRepository.findOneBy({ id });
    }

    return this.userRepository.find({
      where: [
        { username: search ? ILike(`%${search}%`) : ILike("%%") },
        { email: search ? ILike(`%${search}%`) : ILike("%%") },
      ],
      order: { id: "DESC" },
    });
  }

  async login(email: string, password: string): Promise<loginUser> {
    const userLogin = await this.userRepository.findOneBy({
      email,
    });
    if (!userLogin) {
      throw new Error("User not found!");
    }
    if (password !== userLogin.password) {
      throw new Error("invalid password");
    }
    const accessToken = jwt.sign(
      {
        id: userLogin.id,
        email: userLogin.email,
        role: userLogin.role,
      },
      "123"
    );
    return { user: userLogin, token: accessToken };
  }
}
