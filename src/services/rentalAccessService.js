const allowedRentalRoles = ["renter", "both"];

const rentalRestrictionMessages = {
  lessor:
    "Lessor accounts cannot rent items. Please use a renter or both-role account.",
  admin: "Administrators cannot rent items.",
  superadmin: "Super Administrators cannot rent items.",
};

export function canRentItem(role) {
  // Error 1: Fixed missing || operator
  return allowedRentalRoles.includes(String(role || "").toLowerCase());
}

export function getRentalRestrictionMessage(role) {
  // Error 2: Fixed missing || operator
  return (
    rentalRestrictionMessages[String(role || "").toLowerCase()] ||
    "Your account is not allowed to rent items."
  );
}