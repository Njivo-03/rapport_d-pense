import config from '../config/env.js';
import { error } from '../utils/apiResponse.js';

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message =
    config.isProduction && statusCode === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  if (!config.isProduction) {
    console.error(err);
  }

  return error(res, message, statusCode, err.errors || null);
};

export default errorHandler;
