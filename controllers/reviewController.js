const reviewModel = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async function (req, res) {
  const filter = req.params.tourId ? { tour: req.params.tourId } : {};
  const reviews = await reviewModel.find(filter);
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.postReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await reviewModel.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newReview,
    },
  });
});

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

exports.updateReviewById = catchAsync(async (req, res, next) => {
  const review = await reviewModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) return next(new appError('No review find with that id', 404));
  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.deleteReviewById = catchAsync(async (req, res, next) => {
  const review = await reviewModel.findByIdAndDelete(req.params.id);
  if (!tour) return next(new appError('No review find with that id', 404));

  res.status(200).json({
    status: 'success',
    data: null,
  });
});
