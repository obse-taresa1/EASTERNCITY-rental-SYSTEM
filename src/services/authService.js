import { readStorage, removeStorage, writeStorage } from "./storageService.js";
import { users as defaultUsers } from "../data/users.js";

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

export function getUsers() {
  const storedUsers = readStorage(USERS_KEY, null);

  if (storedUsers) {
    return storedUsers;
  }

  writeStorage(USERS_KEY, defaultUsers);
  return defaultUsers;
}

export function saveUsers(users) {
  writeStorage(USERS_KEY, users);
}

export function getCurrentUser() {
  return readStorage(CURRENT_USER_KEY, null);
}

export function setCurrentUser(user) {
  if (!user) {
    removeStorage(CURRENT_USER_KEY);
    return;
  }

  writeStorage(CURRENT_USER_KEY, user);
}

export function authenticateUser(email, password) {
  return (
    getUsers().find(
      (user) =>
        user.email?.toLowerCase() === email.toLowerCase() &&
        user.password === password,
    ) || null
  );
}

export function loginUser(email, password) {
  const user = authenticateUser(email, password);

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    businessName: user.businessName || "",
  };

  setCurrentUser(safeUser);

  return safeUser;
}

export function registerUser(formData) {
  const users = getUsers();

  const existingUser = users.find(
    (user) => user.email?.toLowerCase() === formData.email.toLowerCase(),
  );

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: formData.name,
    email: formData.email,
    password: formData.password,
    role: formData.role || "renter",
    businessName: formData.businessName || "",
  };

  saveUsers([newUser, ...users]);

  const safeUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    businessName: newUser.businessName,
  };

  setCurrentUser(safeUser);

  return safeUser;
}

export function logoutUser() {
  removeStorage(CURRENT_USER_KEY);
}

export function dashboardForRole(role) {
  const routes = {
    admin: "/admin",
    supervisor: "/admin",
    superadmin: "/super-admin",
    "super-admin": "/super-admin",
    lessee: "/renter-dashboard",
    renter: "/renter-dashboard",
    lessor: "/lessor-dashboard",
    both: "/both-dashboard",
  };

  return routes[String(role || "").toLowerCase()] || "/login";
}
