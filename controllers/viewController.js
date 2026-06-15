const tourModel = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  //get tour data from collection
  const tours = await tourModel.find();

  //build template

  //render template using tour data from first step
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res) => {
  const tour = await tourModel
    .findOne({ slug: req.params.slug })
    .populate({ path: 'reviews', fields: 'review rating user' });

  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});
