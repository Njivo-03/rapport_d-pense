import * as authService from '../services/auth.service.js';
import { success, error } from '../utils/apiResponse.js';

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const result = await authService.register({ email, password, firstName, lastName });
    return success(res, result, 'User registered successfully', 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return success(res, result, 'Login successful', 200);
  } catch (err) {
    return error(res, err.message, 401);
  }
};