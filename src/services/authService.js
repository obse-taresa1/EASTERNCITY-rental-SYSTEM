import { readStorage, removeStorage, writeStorage } from "./storageService.js";

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

export function getUsers() {
  return readStorage(USERS_KEY, []);
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

export function dashboardForRole(role) {
  const routes = {
    admin: "/admin",
    supervisor: "/admin",
    superadmin: "/super-admin",
    lessee: "/renter-dashboard",
    renter: "/renter-dashboard",
    lessor: "/lessor-dashboard",
    both: "/both-dashboard",
  };

  return routes[(role || "").toLowerCase()] || "/login";
}
