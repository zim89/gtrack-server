const { validateBody, authenticate, upload } = require('../../middlewares');
const { userJoiSchemas } = require('./user.model');
const userController = require('./user.controller');

const router = require('express').Router();

// @desc    Get current user
// @route 	GET /api/users/current
// @access  Private
// FIXME: Not tested
router.get('/current', authenticate, userController.current);

// @desc    Update user
// @route 	PATCH /api/users/edit
// @access  Private
// FIXME: Not tested load avatar
router.patch(
  '/edit',
  authenticate,
  upload.single('avatar'),
  validateBody(userJoiSchemas.update),
  userController.update
);

// @desc    Update password
// @route 	PATCH /api/users/edit/password
// @access  Private
router.patch(
  '/edit/password',
  authenticate,
  validateBody(userJoiSchemas.updatePassword),
  userController.updatePassword
);

// @desc    Remove user
// @route 	DELETE /api/users/remove
// @access  Private
// FIXME: Not tested
router.delete(
  '/remove',
  authenticate,
  validateBody(userJoiSchemas.remove),
  userController.remove
);

module.exports = router;
