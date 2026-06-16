export function canRent(role) {
  return ["renter", "lessee", "both"].includes((role || "").toLowerCase());
}

export function rentBlockedMessage(role) {
  const normalizedRole = (role || "").toLowerCase();

  if (normalizedRole === "lessor") {
    return "Lessor accounts cannot rent items. Please use a renter or both-role account.";
  }

  if (normalizedRole === "admin" || normalizedRole === "supervisor") {
    return "Administrators cannot rent items.";
  }

  if (normalizedRole === "superadmin" || normalizedRole === "super-admin") {
    return "Super Administrators cannot rent items.";
  }

  return "Please log in to rent this item.";
}
