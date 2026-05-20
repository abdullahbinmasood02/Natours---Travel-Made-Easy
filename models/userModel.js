const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required'],
    minlength: [2, 'name cannot be less than 3 characters'],
    maxlength: [20, 'name must not be greater than 20 characters'],
  },

  email: {
    type: String,
    required: [true, 'email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    default: 'user',
  },

  photo: {
    type: String,
  },

  password: {
    type: String,
    required: [true, 'password is required'],
    minlength: [8, 'password cannot be less than 8 characters'],
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'passwords are not the same',
    },
  },

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre('save', async function (next) {
  //only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  sentPassword,
) {
  return await bcrypt.compare(candidatePassword, sentPassword);
};

userSchema.methods.changedPasswordAfter = function (JwtTimestamp) {
  if (this.passwordChangedAt) {
    console.log(parseInt(this.passwordChangedAt.getTime(), 10), JwtTimestamp);
    return parseInt(this.passwordChangedAt.getTime(), 10) > JwtTimestamp;
  }

  return false;
};

userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  console.log('PLAIN TOKEN:', token);
  console.log('PLAIN TOKEN LENGTH:', token.length); // should be 64
  console.log('HASH SAVED TO DB:  ', this.passwordResetToken);
  return token;
};

const userModel = mongoose.model('users', userSchema);
module.exports = userModel;
