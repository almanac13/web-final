const Joi = require("joi");

const createClubSchema = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  category: Joi.string().min(2).max(30).required(),
  description: Joi.string().allow("").max(500),
});

const updateClubSchema = Joi.object({
  name: Joi.string().min(2).max(60),
  category: Joi.string().min(2).max(30),
  description: Joi.string().allow("").max(500),
});

module.exports = { createClubSchema, updateClubSchema };
