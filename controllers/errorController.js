const appError = require('./../utils/appError');

function handleCastErrorDb(err) {
  const message = `invalid ${err.path}: ${err.value}`;
  return new appError(message, 400);
}

function handleValidationErrorDb(err) {
  const errors = Object.values(err.errors).map((val) => val.message);
  const message = `invalid data: ${errors.join('. ')}`;
  return new appError(message, 400);
}

function handleDuplicateFieldsDB(err) {
  console.log('_______________', err, '_______________');
  const name = err.keyValue.name;
  const message = `Duplicate fields value: ${name}. please use another value`;
  return new appError(message, 400);
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //operational error
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //error due to some dev issue
  } else {
    console.error('ERROR ⚡');
    res.status(500).json({
      status: 'error',
      message: 'something went very wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    if (err.name === 'CastError') {
      error = handleCastErrorDb(error);
      console.log(error.isOperational);
    } else if (err.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    } else if (err.name === 'ValidationError') {
      error = handleValidationErrorDb(err);
    }
    sendErrorProd(error, res);
  }
};
