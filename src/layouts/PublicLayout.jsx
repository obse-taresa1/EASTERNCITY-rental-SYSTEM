import { Outlet } from "react-router-dom";
import BackToTopButton from "../components/common/BackToTopButton.jsx";
import PublicNavbar from "../components/layout/PublicNavbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import SupportChatWidget from "../components/support/SupportChatWidget.jsx";

export default function PublicLayout() {
  return (
    <>
      <PublicNavbar />
      <Outlet />
      <Footer />
      <BackToTopButton />
      <SupportChatWidget />
    </>
  );
}
