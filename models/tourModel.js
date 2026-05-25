const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'Tour name must have less than or equal to 40 characters',
      ],
      minlength: [10, 'tour name must have more or equal to 10 characters'],
      validate: [validator.isAlpha, 'tour name must only contain characters'],
    },

    slug: {
      type: String,
    },

    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'tour must have a max group size'],
    },

    difficulty: {
      type: String,
      required: [true, 'tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be above 1.0'],
      max: [5, 'rating must be below 5.0'],
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    priceDiscount: {
      type: Number,
    },

    summary: {
      type: String,
      trim: true,
      required: [true, 'tour must have a summary'],
    },

    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be less than actual price',
      },
    },

    description: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,
      required: [true, 'tour must have a cover image'],
    },

    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },

    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
  },

  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(docs);
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
