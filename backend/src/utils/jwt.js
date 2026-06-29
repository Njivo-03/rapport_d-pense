import jwt from "jsonwebtoken";

/**
 * Génère un JWT
 * @param {Object} payload
 * @returns {string}
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Vérifie et décode un JWT
 * @param {string} token
 * @returns {Object}
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};