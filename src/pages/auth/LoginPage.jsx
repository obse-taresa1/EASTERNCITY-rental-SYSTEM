import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getDashboardPath, useAuth } from "../../context/AuthContext.jsx";
import {
  canRentItem,
  getRentalRestrictionMessage,
} from "../../services/rentalAccessService.js";

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

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const loggedInUser = login(formData.email, formData.password);

      const pendingRentalUrl = localStorage.getItem("pendingRentalUrl");

      if (pendingRentalUrl) {
        localStorage.removeItem("pendingRentalUrl");

        const itemId = pendingRentalUrl.split("/items/")[1];

        if (itemId && canRentItem(loggedInUser.role)) {
          navigate(`/booking/${itemId}`, { replace: true });
          return;
        }

        if (itemId) {
          navigate(pendingRentalUrl, {
            replace: true,
            state: {
              rentRestrictionMessage: getRentalRestrictionMessage(
                loggedInUser.role,
              ),
            },
          });
          return;
        }
      }

      const from = location.state?.from?.pathname;
      navigate(from || getDashboardPath(loggedInUser.role), { replace: true });
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
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
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
