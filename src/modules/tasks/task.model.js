const { Schema, model } = require('mongoose');
const Joi = require('joi');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const { handleSaveError, runValidateAtUpdate } = require('../../helpers');

const priorities = ['low', 'medium', 'high'];
const categories = ['todo', 'in progress', 'done'];
const dateFormats = {
  time: 'HH:mm',
  date: 'YYYY-MM-DD',
};

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [250, 'Title must not exceed 250 characters'],
    },
    start: {
      type: String,
      required: [true, 'Start date is required'],
      validate: {
        validator: function (date) {
          return dayjs(date, 'HH:mm').isValid();
        },
        message: "Invalid start time format. Use HH:mm (e.g., '09:00').",
      },
    },
    end: {
      type: String,
      required: [true, 'End date is required'],
      validate: [
        {
          validator: function (date) {
            return dayjs(date, 'HH:mm').isValid();
          },
          message: "Invalid end time format. Use HH:mm (e.g., '09:00').",
        },
        {
          validator: function (date) {
            const parsedEnd = dayjs(date, 'HH:mm');
            const parsedStart = dayjs(this._update.$set.start, 'HH:mm');
            return parsedEnd > parsedStart;
          },
          message: 'End time cannot be less than start time.',
        },
      ],
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      default: 'low',
      enum: { values: priorities, message: '{VALUE} is not supported' },
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      validate: {
        validator: function (date) {
          return dayjs(date, 'YYYY-MM-DD').isValid();
        },
        message: "Invalid date format. Use YYYY-MM-DD (e.g., '2023-01-01').",
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'todo',
      enum: { values: categories, message: '{VALUE} is not supported' },
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

taskSchema.post('save', handleSaveError);
taskSchema.pre('findOneAndUpdate', runValidateAtUpdate);
taskSchema.post('findOneAndUpdate', handleSaveError);

const Task = model('task', taskSchema);

const taskJoiSchema = Joi.object({
  title: Joi.string().required().max(250),
  start: Joi.string().required(),
  end: Joi.string().required(),
  priority: Joi.string()
    .required()
    .valid(...priorities)
    .default('low')
    .messages({
      'any.only': `{#label} must be one of "low", "medium" or "high", but got "{#value}"`,
    }),
  date: Joi.string().required(),
  category: Joi.string()
    .required()
    .valid(...categories)
    .default('todo')
    .messages({
      'any.only': `{#label} must be one of "todo", "in-progress", or "done", but got "{#value}"`,
    }),
})
  .custom((value, helper) => {
    const { start, end, date } = value;

    const parsedStart = dayjs(start, dateFormats.time);
    if (!parsedStart.isValid()) {
      return helper.message(
        `Invalid start time format ${start}. Use HH:mm (e.g., '09:00').`
      );
    }

    const parsedEnd = dayjs(end, dateFormats.time);
    if (!parsedEnd.isValid()) {
      return helper.message(
        `Invalid start time format ${end}. Use HH:mm (e.g., '09:00').`
      );
    }

    if (!parsedEnd >= parsedStart) {
      return helper.message(
        `End time ${end} must be later than start time ${start} Joi.`
      );
    }

    const parsedDate = dayjs(date, dateFormats.date);
    if (!parsedDate.isValid) {
      return helper.message(
        `Invalid date format ${date}.  Use YYYY-MM-DD (e.g., '2023-01-01').`
      );
    }
  })
  .messages({
    'string.base': `{#label} should be a type of 'text'`,
    'string.empty': `{#label} cannot be an empty field`,
    'any.required': `{#label} is a required field`,
    'string.max': `{#label} should have a maximum length of {#limit}`,
  });

module.exports = {
  Task,
  taskJoiSchema,
};
