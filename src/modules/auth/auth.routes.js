const { validateBody, authenticate } = require('../../middlewares');
const authController = require('./auth.controller');
const userController = require('../users/user.controller');
const { userJoiSchemas } = require('../users/user.model');

const router = require('express').Router();

// @desc    Register user
// @route 	POST /api/auth/register
// @access  Public
router.post(
  '/register',
  validateBody(userJoiSchemas.register),
  userController.create
);

// @desc    Login
// @route 	POST /api/auth/login
// @access  Public
router.post('/login', validateBody(userJoiSchemas.login), authController.login);

// @desc    Logout
// @route 	POST /api/auth/logout
// @access  Private
router.post('/logout', authenticate, authController.logout);

// @desc    Reset password
// @route 	POST /api/auth/reset
// @access  Public
router.post(
  '/reset',
  validateBody(userJoiSchemas.resetPassword),
  authController.resetPassword
);

// @desc    ???
// @route 	GET /api/auth/remove-key
// @access  Public
// FIXME: not tested
router.get('/remove-key', authenticate, authController.sendSecretKey);

// @desc    Refresh token
// @route 	POST /api/auth/refresh
// @access  Public
router.post(
  '/refresh',
  validateBody(userJoiSchemas.refreshToken),
  authController.refreshToken
);

// @desc    Google auth
// @route 	GET /api/auth/google
// @access  Public
// FIXME: not tested
router.get('/google', authController.googleAuth);

// @desc    Google redirect
// @route 	GET /api/auth/google-redirect
// @access  Public
// FIXME: not tested
router.get('/google-redirect', authController.googleRedirect);

module.exports = router;
