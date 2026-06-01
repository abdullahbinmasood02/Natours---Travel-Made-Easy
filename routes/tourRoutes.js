const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const tourController = require('../controllers/tourController');
const reviewRouter = require('../routes/reviewRoutes');
// const checkTourId = tourController.checkTourId;
// 4.1 routes
// router.param('id', checkTourId);

router.use('/:tourId/reviews', reviewRouter);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
// router.route('/assignment').get(tourController.assignment);
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.postTour);

router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(tourController.updateTourById)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTourById,
  );

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.postReview,
//   );

module.exports = router;
