const VERIFICATION_LABELS = {
  verified: "Verified",
  approved: "Verified",
  not_verified: "Not Verified",
  "not-verified": "Not Verified",
  "not verified": "Not Verified",
  pending: "Pending Verification",
  pending_verification: "Pending Verification",
  "pending-verification": "Pending Verification",
  "pending verification": "Pending Verification",
  rejected: "Verification Rejected",
  rejected_verification: "Verification Rejected",
  "rejected-verification": "Verification Rejected",
  "verification rejected": "Verification Rejected",
  unverified: "Not Verified",
};

export function normalizeVerificationStatus(status) {
  const key = String(status || "").trim().toLowerCase();
  return VERIFICATION_LABELS[key] || "Not Verified";
}

export function isVerificationApproved(status) {
  return normalizeVerificationStatus(status) === "Verified";
}

export function getVerificationTone(status) {
  const normalized = normalizeVerificationStatus(status);

  if (normalized === "Verified") return "verified";
  if (normalized === "Verification Rejected") return "rejected";
  if (normalized === "Pending Verification") return "pending";
  return "not-verified";
}
