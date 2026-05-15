const userModel = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

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
