const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string().min(5).required(),
  bio: Joi.string().min(10).required(),
  age: Joi.number().required(),
});

class CreateAuthorDto {
  name;
  bio;
  age;

  constructor(name, bio, age) {
    this.name = name;
    this.bio = bio;
    this.age = age;
  }

  async validate() {
    try {
      await schema.validateAsync({
        name: this.name,
        age: this.age,
        bio: this.bio,
      });
      return true;
    } catch (err) {
      return false;
    }
  }
}

module.exports = { CreateAuthorDto };
