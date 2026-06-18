import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDashboardPath, useAuth } from "../../context/AuthContext.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "renter",
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
      const registeredUser = register(formData);
      navigate(getDashboardPath(registeredUser.role), { replace: true });
    } catch (registerError) {
      setError(registerError.message || "Registration failed.");
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="section-label">CREATE ACCOUNT</span>
        <h1>Register</h1>
        <p className="text-muted">
          Create your account to rent items or manage your own listings.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

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
              minLength="6"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="role" className="form-label">
              Account Type
            </label>
            <select
              id="role"
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="renter">Renter</option>
              <option value="lessor">Lessor</option>
              <option value="both">Both</option>
            </select>
          </div>

          <button type="submit" className="btn btn-accent-custom w-100">
            Register
          </button>
        </form>

        <p className="mt-4 mb-0 text-center">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
