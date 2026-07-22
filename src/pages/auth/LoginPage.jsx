import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PasswordInput from "../../components/forms/PasswordInput.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { dashboardForRole as getDashboardPath } from "../../services/authService.js";

const PASSWORD_RECOVERY_PATH = "/contact";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      const loggedInUser = await login(formData.email, formData.password);
      const { getStorageItem, removeStorageItem } =
        await import("../../services/storageService.js");

      const pendingContactUrl = getStorageItem("pendingContactUrl", null);
      if (pendingContactUrl) {
        removeStorageItem("pendingContactUrl");
        navigate(pendingContactUrl, {
          replace: true,
          state: {
            contactReadyMessage:
              "You are signed in. Click Contact Owner to start the conversation.",
          },
        });
        return;
      }
      const from = location.state?.from?.pathname;
      const nextRoute = from || getDashboardPath(loggedInUser.role);
      navigate(nextRoute, { replace: true });
    } catch (loginError) {
      setError(loginError.message || "Login failed.");
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="section-label">WELCOME BACK</span>
        <h1>Login</h1>
        <p className="text-muted">
          Access your rental account and continue managing your activity.
        </p>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="text-end mb-3">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
          <button type="submit" className="btn btn-accent-custom w-100">
            Login
          </button>
        </form>
        <p className="mt-4 mb-0 text-center">
          Do not have an account? <Link to="/register">Register</Link>
        </p>
      </section>
    </main>
  );
}
