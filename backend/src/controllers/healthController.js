import { success } from '../utils/apiResponse.js';

export const getHealth = async (req, res) => {
  return success(res, { status: 'ok' }, 'Server is running');
};
