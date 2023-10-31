const { validateBody, authenticate } = require('../../middlewares');
const { reviewJoiSchema } = require('./review.model');
const reviewController = require('./review.controller');

const router = require('express').Router();

// @desc    Get all reviews
// @route 	GET /api/reviews
// @access  Public
router.get('/', reviewController.findAll);

// @desc    Create own review
// @route 	POST /api/reviews/own
// @access  Private
router.post(
  '/own',
  authenticate,
  validateBody(reviewJoiSchema),
  reviewController.create
);

// @desc    Get own review
// @route 	GET /api/reviews/own
// @access  Private
router.get('/own', authenticate, reviewController.findOwn);

// @desc    Update own review
// @route 	PATCH /api/reviews/own
// @access  Private
router.patch(
  '/own',
  authenticate,
  validateBody(reviewJoiSchema),
  reviewController.update
);

// @desc    Remove own review
// @route 	DELETE /api/reviews/own
// @access  Private
router.delete('/own', authenticate, reviewController.remove);

module.exports = router;
