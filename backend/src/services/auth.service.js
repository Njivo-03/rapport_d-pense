import {
  createUser,
  findUserByEmail,
} from "../repositories/auth.repository.js";

import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

export const register = async ({ email, password, firstName, lastName }) => {
  // Vérifier si l'utilisateur existe déjà
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error("Email already in use");
  }

  // Hash du mot de passe
  const passwordHash = await hashPassword(password);

  // Création utilisateur
  const user = await createUser({
    email,
    passwordHash,
    firstName,
    lastName,
  });

  // Génération token
  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  return {
    user,
    token,
  };
};

export const login = async ({ email, password }) => {
  console.log("----- LOGIN DEBUG -----");
  console.log("📩 EMAIL:", email);
  console.log("🔐 PASSWORD:", password);

  const user = await findUserByEmail(email);

  console.log("👤 USER FOUND:", user);

  if (!user) {
    console.log("❌ USER NOT FOUND");
    throw new Error("Invalid credentials");
  }

  if (!user.isActive) {
    console.log("❌ ACCOUNT INACTIVE");
    throw new Error("Account is inactive");
  }

  console.log("🔑 HASH IN DB:", user.passwordHash);

  const isPasswordValid = await comparePassword(
    password,
    user.passwordHash
  );

  console.log("✅ COMPARE RESULT:", isPasswordValid);

  if (!isPasswordValid) {
    console.log("❌ PASSWORD DOES NOT MATCH");
    throw new Error("Invalid credentials");
  }

  console.log("🚀 LOGIN SUCCESS");

  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    token,
  };
};