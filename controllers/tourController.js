const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const factory = require('./handlerFactory');

let Tour = require('./../models/tourModel');

exports.aliasTopTours = (req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: {
      limit: '5',
      sort: '-ratingsAverage,price',
      fields: 'name,price,ratingsAverage,summary,difficulty',
    },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
};

// HANDLERS

exports.getAllTours = factory.getAll(Tour);

exports.postTour = factory.create(Tour);

exports.getTourById = factory.getOne(Tour, { path: 'reviews' });

exports.updateTourById = factory.update(Tour);

exports.deleteTourById = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },

    {
      $sort: {
        avgPrice: -1,
      },
    },

    // {
    //   $match: {
    //     _id: { $ne: 'EASY' },
    //   },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, long] = latlng.split(',');

  if (!lat || !long)
    return next(
      new appError(
        'Please provide latitude and longitude in the format lat,lng.',
        400,
      ),
    );
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[long, lat], radius] } },
  });
  console.log(distance, lat, long);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, long] = latlng.split(',');

  if (!lat || !long)
    return next(
      new appError(
        'Please provide latitude and longitude in the format lat,lng.',
        400,
      ),
    );
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [long * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      distances,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },

    {
      $addFields: { month: '$_id' },
    },

    {
      $project: {
        _id: 0,
      },
    },

    {
      $sort: { numTours: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: plan,
  });
});
