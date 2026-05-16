const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const bcrypt = require('bcrypt');
const { promisify } = require('util');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await userModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('please provide a valid email and password'), 400);

  const user = await userModel.findOne({ email }).select('+password');

  if (user && (await user.correctPassword(password, user.password))) {
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
    });
  } else {
    return next(new AppError('Incorrect email or password', 400));
  }
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //check if token exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please login to get access', 401),
    );
  }
  // verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if user still exists
  const freshUser = await userModel.findById(decoded.id);

  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist',
        401,
      ),
    );
  }

  //check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat * 1000)) {
    return next(new AppError('password was changed! Please login again.', 401));
  }
  //grant access to the protected route
  req.user = freshUser;
  next();
});
