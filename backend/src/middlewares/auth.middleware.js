import { verifyToken } from '../utils/jwt.js';
import { findUserById } from '../repositories/auth.repository.js';

/**
 * Middleware principal d'authentification JWT.
 * Vérifie le token Bearer, charge l'utilisateur depuis la DB,
 * et injecte req.user = { id, email, role, firstName, lastName, isActive, ... }
 *
 * Exporté sous deux noms :
 *  - `protect`       → utilisé dans vos routes auth/expenses existantes
 *  - `authenticate`  → utilisé dans reportRoutes.js
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant ou invalide.',
      });
    }

    const decoded = verifyToken(token);

    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur introuvable.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Compte inactif.',
      });
    }

    // req.user contient : id, email, role, firstName, lastName, isActive, ...
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token expiré ou invalide.',
    });
  }
};

// Alias pour reportRoutes.js qui importe { authenticate }
export const authenticate = protect;