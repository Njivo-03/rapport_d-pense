import { error } from '../utils/apiResponse.js';

const notFound = (req, res) => {
  return error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

export default notFound;
