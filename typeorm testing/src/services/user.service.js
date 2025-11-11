

import { ILike } from "typeorm"
import userRepository from "../repositories/user.repository.js"
import { ApiError } from "../utils/errors.js"
import photoRepository from "../repositories/photo.repository.js"



export class UserService {

     async create(name, email, password, photo) {
          const exist = await userRepository.findOneBy({
               email: email
          })

          if (exist) {
               throw ApiError.badRequest('Email already exit')
          }

          const user = userRepository.create({
               name,
               email,
               password,
          })
          const savedUser = await userRepository.save(user)

          const newPhoto = photoRepository.create({
               path: photo,
               user: {
                    id: savedUser.id
               }
          })
          await photoRepository.save(newPhoto)

          const newUser = await userRepository.findOneBy({ id: savedUser.id }, { relations: ['photos'], })


          return newUser

     }

     async delete(id) {
          const exist = await userRepository.findOneBy({
               id: id
          })

          if (!exist) {
               throw ApiError.badRequest('User not found!')
          }

          const deleted = await userRepository.delete({
               id: id
          })

          return deleted
     }

     async update(id, email, name, password) {
          const exist = await userRepository.findOneBy({
               id: id
          })

          if (!exist) {
               throw ApiError.badRequest('User not found!')
          }

          console.log(email, name, password)

          const updated = await userRepository.update({
               id: id
          }, {
               email: email,
               name: name,
               password: password
          })

          return updated
     }

     // id is opt
     async find(id, search) {
          if (id) {
               return userRepository.findOneBy({ id })
          }


          return userRepository.find({
               where: [
                    {
                         name: search ? ILike(`%${search}%`) : ILike('%%'),
                    },
                    {
                         email: search ? ILike(`%${search}%`) : ILike('%%'),
                    }
               ],
               relations: ['photos'],
               order: {
                    id: "DESC"
               }
          })
     }
}
