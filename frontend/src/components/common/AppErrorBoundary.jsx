import { Component } from "react";

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Application render failure:", error, info);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main className="auth-page">
        <section className="auth-card">
          <span className="section-label">APPLICATION ERROR</span>
          <h1>Unable to load this page</h1>
          <p className="text-muted">
            A component failed while rendering. Check the console for the exact
            error, then refresh after the fix is applied.
          </p>
          <button
            type="button"
            className="btn btn-accent-custom w-100"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </section>
      </main>
    );
  }
}
