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
    role: "both",
    nationalIdFront: "",
    nationalIdBack: "",
  });

  const [error, setError] = useState("");
  const [fileNotice, setFileNotice] = useState("");

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

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!formData.nationalIdFront || !formData.nationalIdBack) {
      setError("Please upload both the front and back side of your National ID.");
      return;
    }

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

          <section className="national-id-verification mb-4">
            <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
              <div>
                <h2 className="h5 mb-1">National ID Verification</h2>
                <p className="text-muted mb-0">Upload both sides to keep EasternCity safe and trusted.</p>
              </div>
              <span className="owner-status owner-status-pending-approval">Pending Verification</span>
            </div>

            {fileNotice && <div className="listing-form-notice">{fileNotice}</div>}

            <div className="id-upload-grid">
              {[
                ["nationalIdFront", "Front Side"],
                ["nationalIdBack", "Back Side"],
              ].map(([fieldName, label]) => (
                <label className="id-upload-card" key={fieldName}>
                  {formData[fieldName] ? (
                    <img src={formData[fieldName]} alt={`${label} preview`} />
                  ) : (
                    <span>
                      <i className="bi bi-card-image"></i>
                      {label}
                    </span>
                  )}
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    hidden
                    onChange={(event) => readIdImage(event.target.files[0], fieldName)}
                  />
                </label>
              ))}
            </div>
          </section>

          <button type="submit" className="btn btn-accent-custom btn-shine w-100">
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
