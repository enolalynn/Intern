import { ILike } from "typeorm";
import userRepository from "../repositories/user.repository.js";
import { ApiError } from "../utils/errors.js";
import photoRepository from "../repositories/photo.repository.js";

export class UserService {
  async create(name, email, password, photo) {
    const exist = await userRepository.findOneBy({
      email: email,
    });

    if (exist) {
      throw ApiError.badRequest("Email already exit");
    }

    const user = userRepository.create({
      name,
      email,
      password,
    });
    const savedUser = await userRepository.save(user);

    const newPhoto = photoRepository.create({
      path: photo,
      user: {
        id: savedUser.id,
      },
    });
    await photoRepository.save(newPhoto);

    const newUser = await userRepository.findOneBy(
      { id: savedUser.id },
      { relations: ["photos"] }
    );

    return newUser;
  }

  async delete(id) {
    const exist = await userRepository.findOneBy({
      id: id,
    });

    if (!exist) {
      throw ApiError.badRequest("User not found!");
    }

    const deleted = await userRepository.delete({
      id: id,
    });

    return deleted;
  }

  // async update(id, email, name, password, photo) {
  //   const exist = await userRepository.findOne({
  //     where: { id: id },
  //     relations: ["photos"],
  //   });
  //   console.log(exist.password);

  //   if (!exist) {
  //     throw ApiError.badRequest("User not found!");
  //   }

  //   console.log(email, name, password, photo);

  //   await userRepository.update(id, {
  //     email,
  //     name,
  //     password,
  //     photo,
  //   });

  //   const updatedUser = await userRepository.findOne(
  //     { id: id },
  //     { relations: ["photos"] }
  //   );
  //   return updatedUser;
  // }
  // }
  async update(id, email, name, password, photo) {
    const exist = await userRepository.findOne({
      where: { id },
      relations: ["photos"],
    });

    if (!exist) {
      throw ApiError.badRequest("User not found!");
    }

    // build an object only with provided fields
    const updateData = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (password) updateData.password = password;

    // only update user if there’s something to update
    if (Object.keys(updateData).length > 0) {
      await userRepository.update(id, updateData);
    }

    // handle photo if provided
    if (photo) {
      const existPhoto = await photoRepository.findOne({
        where: { user: { id } },
      });

      if (existPhoto) {
        await photoRepository.update(existPhoto.id, { path: photo });
      } else {
        const newPhoto = photoRepository.create({
          path: photo,
          user: { id },
        });
        await photoRepository.save(newPhoto);
      }
    }

    // get fresh data
    const updatedUser = await userRepository.findOne({
      where: { id },
      relations: ["photos"],
    });
    console.log(updatedUser);

    return updatedUser;
  }

  // id is opt
  async find(id, search) {
    if (id) {
      return userRepository.findOneBy({ id });
    }

    return userRepository.find({
      where: [
        {
          name: search ? ILike(`%${search}%`) : ILike("%%"),
        },
        {
          email: search ? ILike(`%${search}%`) : ILike("%%"),
        },
      ],
      relations: ["photos"],
      order: {
        id: "DESC",
      },
    });
  }
}
