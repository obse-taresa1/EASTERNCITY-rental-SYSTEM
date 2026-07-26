import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "../../components/forms/PasswordInput.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { dashboardForRole as getDashboardPath } from "../../services/authService.js";
import usePageTitle from "../../hooks/usePageTitle.js";
import "../../styles/auth-premium.css";

export default function RegisterPage() {
  usePageTitle("Register");
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    nationalIdFront: "",
    nationalIdBack: "",
  });

  const [error, setError] = useState("");
  const [fileNotice, setFileNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Helper for password strength
  const getPasswordStrength = (password) => {
    if (!password) return { label: "", color: "" };
    if (password.length < 6) return { label: "Weak", color: "#ef4444" };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return { label: "Strong", color: "#10b981" };
    return { label: "Medium", color: "#f59e0b" };
  };
  const passStrength = getPasswordStrength(formData.password);

  const passwordType = showPassword ? "text" : "password";
  const passwordToggleLabel = showPassword ? "Hide password" : "Show password";

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function readIdImage(file, fieldName) {
    setFileNotice("");
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setFileNotice("National ID uploads must be JPG, JPEG, or PNG.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileNotice("Each National ID image must be 5MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((current) => ({
        ...current,
        [fieldName]: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!formData.nationalIdFront || !formData.nationalIdBack) {
      setError(
        "Please upload both the front and back side of your National ID.",
      );
      return;
    }

    setLoading(true);
    try {
      const registeredUser = await register(formData);
      navigate(getDashboardPath(registeredUser.role), { replace: true });
    } catch (registerError) {
      setError(registerError.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="premium-auth-layout">
      <div className="premium-auth-brand">
        <div className="premium-auth-brand-content">
          <Link to="/" className="premium-auth-brand-logo">
            <i className="bi bi-geo-alt-fill"></i>
            Eastern Cities
          </Link>
          <h1>Join the Community</h1>
          <p>
            Create your account to start renting items or managing your own listings. Trusted, verified, and secure across Eastern Ethiopia.
          </p>
          
          <div className="premium-auth-stats">
            <div className="premium-auth-stat-card">
              <div className="premium-auth-stat-value">230+</div>
              <div className="premium-auth-stat-label">Verified Owners</div>
            </div>
            <div className="premium-auth-stat-card">
              <div className="premium-auth-stat-value">87</div>
              <div className="premium-auth-stat-label">Listings</div>
            </div>
            <div className="premium-auth-stat-card">
              <div className="premium-auth-stat-value">3</div>
              <div className="premium-auth-stat-label">Cities</div>
            </div>
            <div className="premium-auth-stat-card">
              <div className="premium-auth-stat-value">★★★★★</div>
              <div className="premium-auth-stat-label">Community Rated</div>
            </div>
          </div>
        </div>
      </div>
      <div className="premium-auth-form-container">
        <section className="premium-auth-card" style={{ maxWidth: '500px' }}>
          <div className="premium-auth-header">
            <h2>Register</h2>
            <p>Create your account in minutes.</p>
          </div>

          {error && <div className="premium-error-msg"><i className="bi bi-exclamation-circle-fill"></i> {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="premium-form-section">
              <div className="premium-form-section-title">Personal Details</div>
              
              <div className="premium-input-group">
                <label htmlFor="name" className="premium-label">
                  Full Name
                </label>
                <div className="premium-input-wrapper">
                  <i className="bi bi-person leading-icon"></i>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="premium-input has-icon"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Abebe Kebede"
                    required
                  />
                </div>
              </div>

              <div className="premium-input-group">
                <label htmlFor="email" className="premium-label">
                  Email Address
                </label>
                <div className="premium-input-wrapper">
                  <i className="bi bi-envelope leading-icon"></i>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="premium-input has-icon"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="premium-input-group">
                <label htmlFor="password" className="premium-label">
                  Password
                </label>
                <PasswordInput
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength="6"
                  autoComplete="new-password"
                  required
                />
                {formData.password && (
                  <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', fontWeight: 600, color: passStrength.color }}>
                    Password Strength: {passStrength.label}
                  </div>
                )}
              </div>
            </div>

            <div className="premium-form-section mb-4">
              <div className="premium-form-section-title d-flex align-items-center justify-content-between">
                <span>Identity Verification</span>
                <span className="badge bg-warning text-dark rounded-pill" style={{fontSize: '0.75rem'}}>Required</span>
              </div>
              <p className="text-muted" style={{fontSize: '0.85rem', marginBottom: '1rem'}}>
                Upload both sides of your National ID to keep the community safe.
              </p>

              {fileNotice && (
                <div className="premium-error-msg" style={{padding: '0.5rem 1rem', fontSize: '0.8rem', marginBottom: '1rem'}}>
                  <i className="bi bi-info-circle"></i> {fileNotice}
                </div>
              )}

              <div className="premium-upload-grid">
                {[
                  ["nationalIdFront", "Front Side"],
                  ["nationalIdBack", "Back Side"],
                ].map(([fieldName, label]) => (
                  <label className="premium-upload-card" key={fieldName}>
                    {formData[fieldName] ? (
                      <img src={formData[fieldName]} alt={`${label} preview`} />
                    ) : (
                      <>
                        <i className="bi bi-cloud-arrow-up"></i>
                        <span>{label}</span>
                        <div className="premium-upload-hint">Drag & Drop or Browse Files</div>
                        <div className="premium-upload-hint mt-1">PNG • JPG • PDF</div>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      hidden
                      onChange={(event) =>
                        readIdImage(event.target.files[0], fieldName)
                      }
                    />
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="premium-btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Signing In...
                </>
              ) : (
                <>
                  Create My Account
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          <div className="premium-divider">Already a member?</div>
          
          <div className="premium-auth-footer" style={{marginTop: '0'}}>
            <Link to="/login" className="premium-link">Log in to your account</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
