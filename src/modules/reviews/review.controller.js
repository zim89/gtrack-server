const asyncHandler = require('express-async-handler');
const { Review } = require('./review.model');
const { HttpError } = require('../../helpers');

class ReviewController {
  // CREATE
  create = asyncHandler(async (req, res) => {
    const { _id: owner } = req.user;

    const ownReview = await Review.findOne({ owner });

    if (ownReview) {
      throw HttpError(409, 'Review already exist');
    }

    const review = await Review.create({ ...req.body, owner });

    res.status(201).json({ code: 201, data: review });
  });

  // FIND ALL
  findAll = asyncHandler(async (req, res) => {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate('owner', 'username avatar');

    if (!reviews) {
      res.status(400);
      throw new Error('Unable to fetch');
    }

    res
      .status(200)
      .json({ code: 200, data: reviews, quantity: reviews.length });
  });

  // FIND OWN
  findOwn = asyncHandler(async (req, res) => {
    const { _id: owner } = req.user;

    const review = await Review.findOne({ owner });

    if (!review) res.status(200).json({ code: 200, data: null });

    if (review)
      res.status(200).json({
        code: 200,
        data: review,
      });
  });

  // UPDATE
  update = asyncHandler(async (req, res) => {
    const { _id: owner } = req.user;

    const review = await Review.findOneAndUpdate({ owner }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!review) throw HttpError(404, 'Review not found');

    res.status(200).json({ code: 200, data: review });
  });

  // REMOVE
  remove = asyncHandler(async (req, res) => {
    const { _id: owner } = req.user;

    const review = await Review.findOneAndRemove({ owner });

    if (!review) {
      throw HttpError(404, 'Review not found');
    }

    res.status(200).json({
      code: 200,
      data: review,
      message: 'Review deleted successfully',
    });
  });
}

module.exports = new ReviewController();
