const asyncHandler = require('express-async-handler');
const { Task } = require('./task.model');
const { HttpError } = require('../../helpers');

class TaskController {
  // CREATE
  create = asyncHandler(async (req, res) => {
    const { _id: owner } = req.user;

    const task = await Task.create({ ...req.body, owner });

    res.status(201).json({ code: 201, data: task });
  });

  // FIND ALL
  findAllByMonth = asyncHandler(async (req, res) => {
    const { _id: owner } = req.user;
    const { date } = req.query;

    if (!date) {
      throw HttpError(400, 'Bad Request');
    }

    const tasks = await Task.find(
      { owner, date: { $regex: date, $options: 'i' } },
      '-createdAt -updatedAt'
    ).populate('owner', 'username avatar');

    if (!tasks) {
      throw HttpError(404, 'Tasks not found');
    }

    res.status(200).json({ code: 200, data: tasks, quantity: tasks.length });
  });

  // UPDATE
  update = asyncHandler(async (req, res) => {
    const { _id: owner } = req.user;
    const { id } = req.params;

    const task = await Task.findOneAndUpdate({ _id: id, owner }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) throw HttpError(405, 'Not Allowed');

    res.status(200).json({ code: 200, data: task });
  });

  // REMOVE
  remove = asyncHandler(async (req, res) => {
    const { _id: owner } = req.user;
    const { id } = req.params;

    const task = await Task.findOneAndRemove({ _id: id, owner });

    if (!task) {
      throw HttpError(405, 'Not allowed');
    }

    res.status(200).json({
      code: 200,
      data: task,
      message: 'Task deleted successfully',
    });
  });
}

module.exports = new TaskController();
