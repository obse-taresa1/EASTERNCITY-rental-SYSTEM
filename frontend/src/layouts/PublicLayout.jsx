import { Outlet, useLocation } from "react-router-dom";
import BackToTopButton from "../components/common/BackToTopButton.jsx";

import PublicNavbar from "../components/layout/PublicNavbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import SupportChatWidget from "../components/support/SupportChatWidget.jsx";
import MobileBottomNav from "../components/layout/MobileBottomNav.jsx";

export default function PublicLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <PublicNavbar />
      <main className="app-main-content" style={{ flex: 1 }}>
        <Outlet />
      </main>
      {!isAuthPage && (
        <>
          <Footer />
          <MobileBottomNav />
          <BackToTopButton />
          <SupportChatWidget />
        </>
      )}
      {isAuthPage && (
        <div style={{ textAlign: "center", padding: "1.5rem", fontSize: "0.85rem", color: "var(--text-muted)", background: "var(--auth-bg, #FAFBFC)" }}>
          &copy; {new Date().getFullYear()} Eastern Cities. All rights reserved.
        </div>
      )}
    </div>
  );
}
