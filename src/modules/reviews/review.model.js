const { Schema, model } = require('mongoose');
const Joi = require('joi');
const { handleSaveError, runValidateAtUpdate } = require('../../helpers');

const reviewSchema = new Schema(
  {
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
    },
    text: {
      type: String,
      required: [true, 'Review text is required'],
      maxlength: 254,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

reviewSchema.post('save', handleSaveError);
reviewSchema.pre('findOneAndUpdate', runValidateAtUpdate);
reviewSchema.post('findOneAndUpdate', handleSaveError);

const reviewJoiSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required().messages({
    'string.empty': `Rating cannot be an empty field`,
    'any.required': `Rating is a required field`,
  }),
  text: Joi.string().max(300).required().messages({
    'string.empty': `Review cannot be an empty field`,
    'string.max': `Review must not be more than {#limit} characters`,
    'any.required': `Text is a required field`,
  }),
});

const Review = model('review', reviewSchema);

module.exports = { Review, reviewJoiSchema };
