import { Outlet } from "react-router-dom";
import BackToTopButton from "../components/common/BackToTopButton.jsx";
import PublicNavbar from "../components/layout/PublicNavbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import SupportChatWidget from "../components/support/SupportChatWidget.jsx";
import MobileBottomNav from "../components/layout/MobileBottomNav.jsx";

export default function PublicLayout() {
  return (
    <>
      <PublicNavbar />
      <main className="app-main-content">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <BackToTopButton />
      <SupportChatWidget />
    </>
  );
}
