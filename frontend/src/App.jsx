import AppRouter from "./routes/AppRouter.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { RefreshProvider } from "./context/RefreshContext.jsx";
import AppErrorBoundary from "./components/common/AppErrorBoundary.jsx";

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <RefreshProvider>
              <AppRouter />
            </RefreshProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}
