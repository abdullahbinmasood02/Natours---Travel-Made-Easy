const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setParams,
    reviewController.postReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReviewById,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReviewById,
  );

module.exports = router;
