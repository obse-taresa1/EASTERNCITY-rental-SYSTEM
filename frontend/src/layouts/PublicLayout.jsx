import { Outlet } from "react-router-dom";
import BackToTopButton from "../components/common/BackToTopButton.jsx";

import PublicNavbar from "../components/layout/PublicNavbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import SupportChatWidget from "../components/support/SupportChatWidget.jsx";
import MobileBottomNav from "../components/layout/MobileBottomNav.jsx";

export default function PublicLayout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <PublicNavbar />
      <main className="app-main-content" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <BackToTopButton />
      <SupportChatWidget />
    </div>
  );
}
