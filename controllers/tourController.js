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

class APIFeatures {
  //query e.g => Tour.find() queryString => req.query
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    const queryObj = { ...this.queryStr };

    const excluded = ['page', 'sort', 'limit', 'fields'];
    excluded.forEach((el) => delete queryObj[el]);

    let queryString = JSON.stringify(queryObj);

    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );

    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }
  sort() {
    if (this.queryStr.sort) {
      let sortStr = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortStr);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  fields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    //pagination

    const limit = this.queryStr.limit * 1 || 100;
    const page = this.queryStr.page * 1 || 1;

    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

// HANDLERS

exports.getAllTours = async (req, res) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .fields()
      .paginate();

    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.postTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'operation failed',
    });
  }
};

exports.updateTourById = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'operation failed',
    });
  }
};

exports.deleteTourById = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'operation failed',
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'operation failed',
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'operation failed',
    });
  }
};

// exports.assignment = async (req, res) => {
//   try {
//     const result = await Tour.aggregate([
//       {
//         $match: {
//           difficulty: { $in: ['medium', 'difficult'] },
//         },
//       },

//       {
//         $group: {
//           _id: '$difficulty',
//           totalTours: { $sum: 1 },
//           avgPrice: { $avg: '$price' },
//           tourNames: { $push: '$name' },
//         },
//       },

//       {
//         $sort: {
//           avgPrice: -1,
//         },
//       },

//       {
//         $addFields: { label: { $toUpper: '$_id' } },
//       },
//       {
//         $project: { _id: 0 },
//       },
//       {
//         $limit: 2,
//       },
//     ]);

//     res.status(200).json({
//       status: 'success',
//       data: result,
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: err.message,
//     });
//   }
// };
