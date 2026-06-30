import { coerceRole } from "./authService.js";

const allowedRentalRoles = ["USER"];

const rentalRestrictionMessages = {
  ADMIN: "Administrators cannot rent items.",
  SUPER_ADMIN: "Super Administrators cannot rent items.",
};

export function canRentItem(role) {
  return allowedRentalRoles.includes(coerceRole(role));
}

export function getRentalRestrictionMessage(role) {
  return (
    rentalRestrictionMessages[coerceRole(role)] ||
    "Your account is not allowed to rent items."
  );
}

