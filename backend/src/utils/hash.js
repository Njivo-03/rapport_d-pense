import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hash un mot de passe en clair
 * @param {string} password
 * @returns {Promise<string>}
 */
export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare un mot de passe en clair avec un hash
 * @param {string} password
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};