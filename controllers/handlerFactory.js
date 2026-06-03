const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const APIFeatures = require('../utils/ApiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document)
      return next(new appError('No document found with that id', 404));

    res.status(200).json({
      status: 'success',
      data: null,
    });
  });

exports.update = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new appError('No document found with that id', 404));
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.create = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    console.log(req.params.id);
    console.log(populateOptions);
    const doc = await Model.findById(req.params.id).populate(populateOptions);

    if (!doc) return next(new appError('No Document found with that id', 404));

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req?.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fields()
      .paginate();

    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
