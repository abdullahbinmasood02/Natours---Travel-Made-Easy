const userModel = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

function filterObj(toFilter, ...args) {
  const keys = Object.keys(toFilter);
  const newObj = {};
  keys.forEach((key) => {
    if (args.includes(key)) newObj[key] = toFilter[key];
  });
  return newObj;
}

exports.getUserById = (req, res) => {
  console.log('route not implemented');

  res.status(500).json({ message: 'route not defind' });
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await userModel.find();
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for passwords updation. please use /updatePassword to update passwords',
        400,
      ),
    );
  }
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await userModel.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: 'success',
    user: {
      updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async function (req, res, next) {
  await userModel.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.updateUserById = (req, res) => {
  console.log('route not implemented');
  res.status(500).json({ message: 'route not defind' });
};

exports.deleteUserById = (req, res) => {
  console.log('route not implemented');
  res.status(500).json({ message: 'route not defind' });
};

exports.postUser = (req, res) => {
  console.log('route not defined');
  res.status(500).json({ message: 'route not defind' });
};
