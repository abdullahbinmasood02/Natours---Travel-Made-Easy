const mongoose = require('mongoose');
const tourModel = require('./tourModel');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'please enter the review'],
    },
    rating: {
      type: Number,
      required: [true, 'please enter a rating'],
      min: 1.0,
      max: 5.0,
    },
    createdAt: { type: Date, default: Date.now },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'review must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'users',
      required: [true, 'review must have an author'],
    },
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

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  await tourModel.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating,
  });
  console.log(stats[0].nRating);
};
reviewSchema.post('save', async function () {
  await this.constructor.calcAverageRatings(this.tour);
});
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'Tour',
  //   select: 'name',
  // })
  this.populate({ path: 'user', select: 'name photo' });
  next();
});

const reviewModel = mongoose.model('reviews', reviewSchema);
module.exports = reviewModel;
