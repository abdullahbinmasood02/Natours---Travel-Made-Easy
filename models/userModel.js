const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

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

const userModel = mongoose.model('users', userSchema);
module.exports = userModel;
