const express = require('express');
const appError = require('./utils/appError');
const morgan = require('morgan');
const globalErrorController = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const reviewRouter = require('./routes/reviewRoutes');
const app = express();
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');

//set security headers
app.use(helmet());

//limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in one hour.',
});

app.use('/api', limiter);

//body parser
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));

//data sanitization against noSQL query injection

app.use(mongoSanitize());

//data sanitization against xss attacks

app.use(xss());

//serving static files
app.use(express.static(`${__dirname}/public`));

//preventing parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// MOUNTING ROUTERS

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new appError(`route ${req.originalUrl} not found on this server`), 404);
});

app.use(globalErrorController);

module.exports = app;
