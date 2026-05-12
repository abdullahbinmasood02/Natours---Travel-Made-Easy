const express = require('express');

const morgan = require('morgan');

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
  res.status(404).json({
    status: 'fail',
    message: `cant find ${req.originalUrl} on this server!`,
  });
});

module.exports = app;
