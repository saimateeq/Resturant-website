import { ApiError } from '../utils/ApiError.js';

export function errorHandler(err, req, res, next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';

    if (error.name === 'CastError') {
      statusCode = 400;
      message = `Invalid value for field: ${error.path}`;
    }

    if (error.code === 11000) {
      statusCode = 409;
      const field = Object.keys(error.keyValue || {})[0];
      message = `${field} already exists`;
    }

    if (error.name === 'ValidationError') {
      statusCode = 400;
      message = Object.values(error.errors)
        .map((val) => val.message)
        .join(', ');
    }

    if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    }

    if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    }

    error = new ApiError(statusCode, message, error.errors || []);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(error.statusCode).json(response);
}
