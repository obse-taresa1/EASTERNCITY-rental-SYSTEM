import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { changePassword } from "../../services/authService.js";
import { updateUser, updateUserProfileImage } from "../../services/userApiService.js";
import { getInitials } from "../../utils/user.js";

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function roleLabel(role) {
  const normalized = String(role || "ADMIN").toUpperCase();
  if (normalized === "SUPER_ADMIN") return "Super Admin";
  if (normalized === "ADMIN") return "Admin";
  return "User";
}

function getPasswordStrength(password) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  if (!password) return { label: "Required", score: 0 };
  if (score < 3) return { label: "Weak", score };
  if (score < 5) return { label: "Good", score };
  return { label: "Strong", score };
}

export default function AdminProfilePage() {
  const { currentUser, user, setCurrentUser } = useAuth();
  const activeUser = user || currentUser;

  const [profileForm, setProfileForm] = useState({
    name: activeUser?.name || "",
    phone: activeUser?.phone || "",
    avatar: activeUser?.avatar || activeUser?.profileImage || activeUser?.profileImageUrl || "",
    avatarFile: null,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileNotice, setProfileNotice] = useState(null);
  const [passwordNotice, setPasswordNotice] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setProfileForm({
      name: activeUser?.name || "",
      phone: activeUser?.phone || "",
      avatar: activeUser?.avatar || activeUser?.profileImage || activeUser?.profileImageUrl || "",
      avatarFile: null,
    });
  }, [activeUser?.id, activeUser?.name, activeUser?.phone, activeUser?.avatar, activeUser?.profileImage, activeUser?.profileImageUrl]);

  const passwordStrength = useMemo(
    () => getPasswordStrength(passwordForm.newPassword),
    [passwordForm.newPassword],
  );

  function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileNotice({ type: "error", text: "Please upload a valid image file." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm((current) => ({ ...current, avatar: reader.result, avatarFile: file }));
    };
    reader.readAsDataURL(file);
  }

  async function handleProfileSave(event) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileNotice(null);

    try {
      const profilePayload = {
        name: profileForm.name,
        phone: profileForm.phone,
      };

      if (
        !profileForm.avatar &&
        (activeUser?.profileImageUrl || activeUser?.profileImage || activeUser?.avatar)
      ) {
        profilePayload.profileImageUrl = "";
      }

      let updatedUser = await updateUser(activeUser.id, profilePayload);

      if (profileForm.avatarFile) {
        updatedUser = await updateUserProfileImage(activeUser.id, profileForm.avatarFile);
      }

      setCurrentUser({
        ...activeUser,
        ...updatedUser,
        phone: updatedUser?.phone || profileForm.phone,
        avatar: updatedUser?.avatar || profileForm.avatar,
        profileImage: updatedUser?.profileImage || profileForm.avatar,
        profileImageUrl: updatedUser?.profileImageUrl || activeUser?.profileImageUrl || "",
      });
      setProfileForm((current) => ({ ...current, avatarFile: null }));
      setProfileNotice({ type: "success", text: "Profile updated successfully." });
    } catch (error) {
      setProfileNotice({ type: "error", text: error.message || "Unable to update profile." });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSave(event) {
    event.preventDefault();
    setPasswordNotice(null);

    if (!passwordForm.currentPassword) {
      setPasswordNotice({ type: "error", text: "Current password is required." });
      return;
    }

    if (passwordStrength.score < 3) {
      setPasswordNotice({ type: "error", text: "Use at least 8 characters with a mix of letters and numbers." });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordNotice({ type: "error", text: "Confirm password must match the new password." });
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordNotice({ type: "success", text: "Password changed successfully." });
    } catch (error) {
      setPasswordNotice({ type: "error", text: error.message || "Unable to change password." });
    } finally {
      setSavingPassword(false);
    }
  }

  const accountInfo = [
    { label: "Role", value: roleLabel(activeUser?.role), icon: "bi-shield-check" },
    { label: "Status", value: activeUser?.status || "ACTIVE", icon: "bi-activity" },
    { label: "Created Date", value: formatDate(activeUser?.createdAt), icon: "bi-calendar3" },
    { label: "Last Login", value: activeUser?.lastLoginAt ? formatDate(activeUser.lastLoginAt) : "Not available", icon: "bi-clock-history" },
    { label: "Email", value: activeUser?.email || "Email not available", icon: "bi-envelope" },
  ];

  return (
    <main className="dashboard-content admin-profile-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">{roleLabel(activeUser?.role)}</span>
          <h1 className="h3 mb-0">Profile</h1>
          <p className="text-muted mb-0">Manage your account information and security.</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-4">
          <section className="admin-table-container h-100">
            <div className="text-center">
              <div className="admin-profile-avatar-xl mx-auto mb-3">
                {profileForm.avatar ? (
                  <img src={profileForm.avatar} alt="Admin profile" />
                ) : (
                  <span>{getInitials(profileForm.name || activeUser?.name)}</span>
                )}
              </div>
              <h2 className="h4 mb-1">{profileForm.name || "Admin"}</h2>
              <p className="text-muted mb-3">{activeUser?.email}</p>
              <span className="badge bg-danger-subtle text-danger">{roleLabel(activeUser?.role)}</span>
            </div>

            <div className="admin-profile-info-grid mt-4">
              {accountInfo.map((item) => (
                <div className="admin-profile-info-card" key={item.label}>
                  <i className={`bi ${item.icon}`} />
                  <div>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="col-xl-8">
          <section className="admin-table-container mb-4">
            <h2 className="h5 mb-3">Editable Details</h2>
            {profileNotice && (
              <div className={`alert ${profileNotice.type === "success" ? "alert-success" : "alert-danger"}`}>
                {profileNotice.text}
              </div>
            )}
            <form onSubmit={handleProfileSave}>
              <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                <label className="btn btn-outline-danger mb-0" htmlFor="admin-profile-photo">
                  <i className="bi bi-upload me-2" />
                  Change Image
                </label>
                <input id="admin-profile-photo" type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                {profileForm.avatar && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setProfileForm((current) => ({ ...current, avatar: "", avatarFile: null }))}
                  >
                    Remove Image
                  </button>
                )}
                <span className="text-muted small">Preview before saving. JPG, PNG, or WEBP.</span>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="admin-name">Full Name</label>
                  <input
                    id="admin-name"
                    className="form-control"
                    value={profileForm.name}
                    onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="admin-email">Email</label>
                  <input id="admin-email" className="form-control" value={activeUser?.email || ""} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="admin-phone">Phone Number</label>
                  <input
                    id="admin-phone"
                    className="form-control"
                    value={profileForm.phone}
                    placeholder="+251 900 000 000"
                    onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="admin-department">Department</label>
                  <input id="admin-department" className="form-control" value="Administration" readOnly />
                </div>
              </div>
              <button type="submit" className="btn btn-accent-custom mt-4" disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </section>

          <section className="admin-table-container">
            <h2 className="h5 mb-3">Change Password</h2>
            {passwordNotice && (
              <div className={`alert ${passwordNotice.type === "success" ? "alert-success" : "alert-danger"}`}>
                {passwordNotice.text}
              </div>
            )}
            <form onSubmit={handlePasswordSave}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label" htmlFor="admin-current-password">Current Password</label>
                  <input
                    id="admin-current-password"
                    type="password"
                    className="form-control"
                    value={passwordForm.currentPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="admin-new-password">New Password</label>
                  <input
                    id="admin-new-password"
                    type="password"
                    className="form-control"
                    value={passwordForm.newPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                    required
                  />
                  <small className="text-muted">Strength: {passwordStrength.label}</small>
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="admin-confirm-password">Confirm Password</label>
                  <input
                    id="admin-confirm-password"
                    type="password"
                    className="form-control"
                    value={passwordForm.confirmPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-accent-custom mt-4" disabled={savingPassword}>
                {savingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
