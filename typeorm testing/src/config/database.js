import { DataSource } from 'typeorm'
import User from '../entities/User.js'
import Photo from '../entities/Photo.js'


export const AppDataSource = new DataSource({
     type: "postgres",
     host: "localhost",
     port: 5433,
     username: "postgres",
     password: "admin",
     database: "typeorm-testing",
     synchronize: false,
     // logging: true,
     entities: [User, Photo],
     subscribers: [],
     migrations: ['src/migrations/*.js'],
})