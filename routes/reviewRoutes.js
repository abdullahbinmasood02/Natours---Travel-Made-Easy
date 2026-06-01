const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.postReview,
  );

router
  .route('/:id')
  .get(reviewController.getReviewById)
  .patch(reviewController.updateReviewById)
  .delete(reviewController.deleteReviewById);

module.exports = router;
