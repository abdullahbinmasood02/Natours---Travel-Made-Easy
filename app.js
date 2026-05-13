const express = require('express');
const appError = require('./utils/appError');
const morgan = require('morgan');
const globalErrorController = require('./controllers/errorController');

const app = express();
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// MOUNTING ROUTERS

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new appError(`route ${req.originalUrl} not found on this server`), 404);
});

app.use(globalErrorController);

module.exports = app;
