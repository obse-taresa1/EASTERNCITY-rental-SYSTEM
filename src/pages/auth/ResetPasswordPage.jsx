import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PasswordInput from "../../components/forms/PasswordInput.jsx";
import { resetPassword } from "../../services/authService.js";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await resetPassword({
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      setMessage(
        result.message ||
          "Password reset successfully. Please log in with your new password.",
      );
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (resetError) {
      setError(resetError.message || "Unable to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="section-label">RESET PASSWORD</span>
        <h1>Choose New Password</h1>
        <p className="text-muted">
          Enter and confirm your new account password.
        </p>

        {!token && (
          <div className="alert alert-danger">
            Password reset token is missing. Request a new reset link.
          </div>
        )}
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              minLength="6"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength="6"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-accent-custom w-100"
            disabled={!token || isSubmitting}
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-4 mb-0 text-center">
          Back to <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
