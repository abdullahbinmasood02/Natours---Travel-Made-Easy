const express = require('express');

const router = express.Router();
const tourController = require('../controllers/tourController');

// const checkTourId = tourController.checkTourId;
// 4.1 routes
// router.param('id', checkTourId);

router.route('/').get(tourController.getAllTours).post(tourController.postTour);

router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(tourController.updateTourById)
  .delete(tourController.deleteTourById);

module.exports = router;
