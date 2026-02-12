const Joi = require("joi");


const createClubSchema = Joi.object({
  name: Joi.string().min(2).required(),
  category: Joi.string().min(2).required(),
  department: Joi.string().allow("").optional(),
  description: Joi.string().min(5).required(),

  // key required for creating club
  departmentKey: Joi.string().min(4).required(),
});


const updateClubSchema = Joi.object({
  name: Joi.string().min(2).max(60),
  category: Joi.string().min(2).max(30),
  description: Joi.string().allow("").max(500),
});

module.exports = { createClubSchema, updateClubSchema };
