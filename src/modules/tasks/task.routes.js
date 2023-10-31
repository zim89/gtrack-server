const { isValidId, authenticate, validateBody } = require('../../middlewares');
const { taskJoiSchema } = require('./task.model');
const TaskController = require('./task.controller');

const router = require('express').Router();

// @desc    Get all tasks by month
// @route 	GET /api/tasks
// @access  Private
router.get('/', authenticate, TaskController.findAllByMonth);

// @desc    Create task
// @route 	POST /api/tasks
// @access  Private
router.post(
  '/',
  authenticate,
  validateBody(taskJoiSchema),
  TaskController.create
);

// @desc    Update task
// @route 	PATCH /api/tasks/:id
// @access  Private
router.patch(
  '/:id',
  authenticate,
  validateBody(taskJoiSchema),
  isValidId,
  TaskController.update
);

// @desc    Remove task
// @route 	DELETE /api/tasks/:id
// @access  Private
router.delete('/:id', authenticate, isValidId, TaskController.remove);

module.exports = router;
