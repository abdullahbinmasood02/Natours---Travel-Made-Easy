const reviewModel = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllReviews = factory.getAll(reviewModel);

exports.setParams = function (req, res, next) {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
};
exports.postReview = factory.create(reviewModel);

exports.getReviewById = catchAsync(async (req, res, next) => {
  const review = await reviewModel.findById(req.params.id);

  if (!tour) return next(new appError('No review found with that id', 404));

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.updateReviewById = factory.update(reviewModel);
exports.deleteReviewById = factory.deleteOne(reviewModel);
exports.getReview = factory.getOne(reviewModel);
