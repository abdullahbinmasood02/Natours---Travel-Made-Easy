const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { promisify } = require('util');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

function createSendToken(user, statusCode, res) {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await userModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role || 'user',
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('please provide a valid email and password'), 400);

  const user = await userModel.findOne({ email }).select('+password');

  if (user && (await user.correctPassword(user.password, password))) {
    createSendToken(user, 201, res);
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

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1. get user based on posted email
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) next(new AppError('user with this email address not found.', 404));
  //2. generate the random token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3, send it to user's email

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `forgot your password? submit a patch request with your new password and passwordConfirm to: ${resetURL}\n If you did'nt forget your password, please ignore this email `;
  try {
    await sendEmail({
      mail: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email, try again later',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async function (req, res, next) {
  //1. Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await userModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // console.log(user);
  // console.log('TOKEN FROM URL:       ', req.params.token);
  // console.log('TOKEN FROM URL LENGTH:', req.params.token.length); // should be 64
  // console.log('HASH COMPUTED:        ', hashedToken);

  //2. If token has not expired, and there is a user, set the new password
  if (!user) return next(new AppError('Token is invalid or expired', 404));
  // 3. update changedPasswordAt field
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  console.log(req.body.password);
  await user.save();
  // //4. log the user in, send JWT
  console.log(user._id);
  createSendToken(user, 201, res);
});

exports.updatePassword = catchAsync(async function (req, res, next) {
  // get user from collection

  const user = await userModel.findById(req.user.id).select('password');

  if (!(await user.correctPassword(user.password, req.body.passwordCurrent)))
    return next(new AppError('Password is incorrect'));

  user.password = req.body.passwordNew;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 201, res);
});
