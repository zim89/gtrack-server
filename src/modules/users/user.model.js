const { Schema, model } = require('mongoose');
const Joi = require('joi');
const { handleSaveError, runValidateAtUpdate } = require('../../helpers');

const emailRegexp = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema(
  {
    email: {
      type: String,
      match: [emailRegexp],
      required: [true, 'Email is required'],
      unique: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
    },
    password: {
      type: String,
      minLength: 6,
      required: [true, 'Password is required'],
    },
    avatar: {
      type: String,
      default: '',
    },
    birthday: {
      type: String,
      default: '',
    },
    skype: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    token: {
      type: String,
      default: '',
    },
    refreshToken: {
      type: String,
      default: '',
    },
    isGoogleAuth: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

userSchema.post('save', handleSaveError);
userSchema.pre('findOneAndUpdate', runValidateAtUpdate);
userSchema.post('findOneAndUpdate', handleSaveError);
const User = model('users', userSchema);

const verifyEmail = Joi.object({
  email: Joi.string().pattern(emailRegexp).required().messages({
    'string.base': `"email" should be a type of 'text'`,
    'string.empty': `"email" cannot be an empty field`,
    'string.pattern.base': `"email" is not valid`,
    'any.required': `"email" is a required field`,
  }),
});

const register = Joi.object({
  username: Joi.string().required().messages({
    'string.base': `"username" should be a type of 'text'`,
    'string.empty': `"username" cannot be an empty field`,
    'any.required': `"username" is a required field`,
  }),
  email: Joi.string().pattern(emailRegexp).required().messages({
    'string.base': `"email" should be a type of 'text'`,
    'string.empty': `"email" cannot be an empty field`,
    'string.pattern.base': `"email" is not valid`,
    'any.required': `"email" is a required field`,
  }),
  password: Joi.string().required().min(6).messages({
    'string.base': `"password" should be a type of 'text'`,
    'string.empty': `"password" cannot be an empty field`,
    'string.min': `"password" should have a minimum length of {#limit} symbols`,
    'any.required': `"password" is a required field`,
  }),
  token: Joi.string(),
  refreshToken: Joi.string(),
});

const login = Joi.object({
  email: Joi.string().required().pattern(emailRegexp).messages({
    'string.base': `"email" should be a type of 'text'`,
    'string.empty': `"email" cannot be an empty field`,
    'string.pattern.base': `"email" is not valid`,
    'any.required': `"email" is a required field`,
  }),
  password: Joi.string().required().min(6).messages({
    'string.base': `"password" !should be a type of 'text'`,
    'string.empty': `"password" !cannot be an empty field`,
    'string.min': `"password" !should have a minimum length of {#limit}`,
    'any.required': `"password" !is a required field`,
  }),
  token: Joi.string(),
  refreshToken: Joi.string(),
});

const update = Joi.object({
  username: Joi.string().messages({
    'string.base': `"username" should be a type of 'text'`,
    'string.empty': `"username" cannot be an empty field`,
  }),
  email: Joi.string().required().pattern(emailRegexp).messages({
    'string.base': `"email" should be a type of 'text'`,
    'string.empty': `"email" cannot be an empty field`,
    'string.pattern.base': `"email" is not valid`,
    'any.required': `"email" is a required field`,
  }),
  avatar: Joi.string().min(0),
  birthday: Joi.string().min(0),
  skype: Joi.string().min(0),
  phone: Joi.string().min(0).messages({
    'string.base': `"phone" should be a type of 'text'`,
    'string.pattern.base': `"phone" is not valid`,
  }),
});

const resetPassword = Joi.object({
  email: Joi.string().required().pattern(emailRegexp).messages({
    'string.base': `"email" should be a type of 'text'`,
    'string.empty': `"email" cannot be an empty field`,
    'string.pattern.base': `"email" is not valid`,
    'any.required': `"email" is a required field`,
  }),
});

const updatePassword = Joi.object({
  newPassword: Joi.string().required().min(6).messages({
    'string.base': `"password" should be a type of 'text'`,
    'string.empty': `"password" cannot be an empty field`,
    'string.min': `"password" should have a minimum length of {#limit}`,
  }),
  oldPassword: Joi.string().required().min(6).messages({
    'string.base': `"password" should be a type of 'text'`,
    'string.empty': `"password" cannot be an empty field`,
    'string.min': `"password" should have a minimum length of {#limit}`,
  }),
});

const refreshToken = Joi.object({
  refreshToken: Joi.string().required(),
});

const remove = Joi.object({
  secretKey: Joi.string().required().messages({
    'string.base': `"secretKey" !should be a type of 'text'`,
    'string.empty': `"secretKey" !cannot be an empty field`,
    'any.required': `"secretKey" !is a required field`,
  }),
});

const userJoiSchemas = {
  register,
  verifyEmail,
  login,
  update,
  updatePassword,
  resetPassword,
  refreshToken,
  remove,
};

module.exports = { User, userJoiSchemas };
