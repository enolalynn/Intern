import { AppDataSource } from "../config/database.js";
import Photo from "../entities/Photo.js";


const photoRepository = AppDataSource.getRepository(Photo);
export default photoRepository;