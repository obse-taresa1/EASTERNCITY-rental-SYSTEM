import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BackToTopButton from "../components/common/BackToTopButton.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

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
        <Suspense fallback={<LoadingSpinner fullPage={true} />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      {!isAuthPage && (
        <>
          <MobileBottomNav />
          <BackToTopButton />
          <SupportChatWidget />
        </>
      )}
    </div>
  );
}
