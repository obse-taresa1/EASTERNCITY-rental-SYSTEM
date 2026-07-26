import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PasswordInput from "../../components/forms/PasswordInput.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { dashboardForRole as getDashboardPath } from "../../services/authService.js";
import usePageTitle from "../../hooks/usePageTitle.js";
import lightLogo from "../../assets/images/eastern-cities-header-logo-transparent.png";
import darkLogo from "../../assets/images/eastern-cities-header-logo-dark.png";
import "../../styles/auth-premium.css";

const PASSWORD_RECOVERY_PATH = "/contact";
const GOOGLE_IDENTITY_SCRIPT = "https://accounts.google.com/gsi/client";

let googleIdentityScriptPromise;

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  if (!googleIdentityScriptPromise) {
    googleIdentityScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        `script[src="${GOOGLE_IDENTITY_SCRIPT}"]`,
      );

      if (existingScript) {
        existingScript.addEventListener("load", resolve, { once: true });
        existingScript.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = GOOGLE_IDENTITY_SCRIPT;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  return googleIdentityScriptPromise;
}

async function requestGoogleUser(loginWithGoogle, googleClientId) {
  if (!googleClientId) {
    throw new Error("Google Sign-In is not configured. Add VITE_GOOGLE_CLIENT_ID to the frontend environment.");
  }

  await loadGoogleIdentityScript();

  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: googleClientId,
      scope: "openid email profile",
      prompt: "select_account",
      callback: async (googleResponse) => {
        const accessToken = googleResponse?.access_token;

        if (!accessToken) {
          reject(new Error("Google did not return an accessible email address. Please choose a Google account with email permission enabled."));
          return;
        }

        try {
          resolve(await loginWithGoogle({ accessToken }));
        } catch (error) {
          reject(error);
        }
      },
      error_callback: () => {
        reject(new Error("Google sign-in was not completed. Please try again."));
      },
    });

    tokenClient.requestAccessToken();
  });
}

export default function LoginPage() {
  usePageTitle("Login");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const { theme } = useTheme();
  const authLogo = theme === "dark" ? darkLogo : lightLogo;
  const googleClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID || "";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google login handler
  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError("");
    try {
      // Call the auth service – adjust if a dedicated endpoint exists
      const loggedInUser = await requestGoogleUser(loginWithGoogle, googleClientId);
      const from = location.state?.from?.pathname;
      const nextRoute = from || getDashboardPath(loggedInUser.role);
      navigate(nextRoute, { replace: true });
    } catch (err) {
      setError(err?.message ?? "Google sign‑in failed.");
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="premium-auth-layout">
      <div className="premium-auth-brand">
        <div className="premium-auth-brand-content">
          <Link to="/" className="premium-auth-brand-logo">
            <img src={authLogo} alt="Eastern Cities" />
          </Link>
          <div className="premium-auth-copy">
            <span className="premium-auth-eyebrow">Eastern Ethiopia Rentals</span>
            <h1>Welcome Back</h1>
            <p>
              Sign in to access your rental account, manage your listings, and connect with trusted verified users across Eastern Ethiopia.
            </p>
          </div>
          <div className="premium-auth-features" aria-label="Platform trust features">
            {[
              "National ID Verified",
              "Secure Platform Payments",
              "Trusted Community",
              "Available in Harar, Dire Dawa & Jigjiga",
            ].map((feature) => (
              <div className="premium-auth-feature" key={feature}>
                <span className="premium-auth-check">
                  <i className="bi bi-check-lg"></i>
                </span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="premium-auth-stats">
            <div className="premium-auth-stat-card">
              <div className="premium-auth-stat-value">230+</div>
              <div className="premium-auth-stat-label">Verified Users</div>
            </div>
            <div className="premium-auth-stat-card">
              <div className="premium-auth-stat-value">87</div>
              <div className="premium-auth-stat-label">Active Listings</div>
            </div>
            <div className="premium-auth-stat-card">
              <div className="premium-auth-stat-value">3</div>
              <div className="premium-auth-stat-label">Cities</div>
            </div>
            <div className="premium-auth-stat-card">
              <div className="premium-auth-stat-value premium-auth-stars" aria-label="Five star rating">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <div className="premium-auth-stat-label">Community Rated</div>
            </div>
          </div>
        </div>
      </div>
      <div className="premium-auth-form-container">
        <section className="premium-auth-card" style={{ maxWidth: '420px' }}>
          <div className="premium-auth-header">
            <h2>Log In</h2>
            <p>Enter your details to proceed.</p>
          </div>
          {error && <div className="premium-error-msg"><i className="bi bi-exclamation-circle-fill"></i> {error}</div>}
          <form onSubmit={handleSubmit}>
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
                autoComplete="current-password"
                required
              />
            </div>
            <div className="premium-auth-actions">
              <label className="premium-checkbox-wrapper">
                <input type="checkbox" name="remember" />
                <div className="premium-checkbox-custom"><i className="bi bi-check-lg"></i></div>
                <span className="text-muted" style={{fontSize: '0.875rem', fontWeight: 500}}>Remember me</span>
              </label>
              <Link to="/forgot-password" className="premium-link">Forgot Password?</Link>
            </div>
            <button type="submit" className="premium-btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Signing In...
                </>
              ) : (
                <>
                  Log In
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          </form>
          
          <div className="premium-divider">or continue with</div>
          
          <button type="button" className="premium-btn-google" style={{marginBottom: '1.5rem'}} onClick={handleGoogleLogin} disabled={googleLoading}>
            {googleLoading ? (
              <>
                <span className="spinner-border spinner-border-sm text-muted" role="status" aria-hidden="true"></span>
                Connecting to Google...
              </>
            ) : (
              <>
                <i className="bi bi-google text-danger"></i> Continue with Google
              </>
            )}
          </button>
          
          <div className="premium-auth-footer">
            Don't have an account? <Link to="/register" className="premium-link">Register</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
