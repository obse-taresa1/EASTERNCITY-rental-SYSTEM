import React from "react";

export default function LoadingSpinner({ fullPage = false, message = "Loading..." }) {
  if (fullPage) {
    return (
      <div className="ud-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner-border text-danger" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        {message && <div className="text-muted">{message}</div>}
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center my-5">
      <div className="spinner-border text-danger" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
