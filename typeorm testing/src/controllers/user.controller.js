import { UserService } from "../services/user.service.js";
import { ApiError } from "../utils/errors.js";
import { apiSuccess } from "../utils/response.js";

const userService = new UserService();

export async function createUser(req, res, next) {
  // console.log(req.req)
  try {
    const { name, email, password, photo } = req.body;

    if (!name || !email || !password || !photo) {
      throw ApiError.badRequest("Please provide require fields");
    }

    const user = await userService.create(name, email, password, photo);
    return apiSuccess(res, 201, "user sucessfully created!", user);
    // user class's create methods calling -> user entity (name,email,password)
    // util class's sendEmail emthods calling ->
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  // console.log(req.req)
  try {
    const { id } = req.params;

    if (!id) {
      throw ApiError.badRequest("Please provide require fields");
    }

    const deletedUser = await userService.delete(id);
    return apiSuccess(res, 201, "user sucessfully deleted!", deletedUser);
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  // console.log(req.req)
  try {
    const { id } = req.params;
    console.log(id);
    const { name, email, password, photo } = req.body;
    console.log(name, email, password, photo);

    if (!id) {
      throw ApiError.badRequest("Please provide require fields");
    }

    const updatedUser = await userService.update(
      id,
      email,
      name,
      password,
      photo
    );
    return apiSuccess(res, 201, "user sucessfully updated!", updatedUser);
  } catch (error) {
    next(error);
  }
}

export async function find(req, res, next) {
  // console.log(req.req)
  try {
    const { id } = req.params;
    const { search } = req.query;

    const users = await userService.find(id, search);
    return apiSuccess(res, 201, "user sucessfully fetched!", users);
  } catch (error) {
    next(error);
  }
}
