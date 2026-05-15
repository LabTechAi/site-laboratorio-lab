/**
 * App.tsx — Root router for the LAB ecosystem.
 *
 * Routes:
 *  /           → Home (institutional site, wrapped in MainLayout with Header + Footer)
 *  /parceiros  → Parceiros (standalone landing page — has its own header)
 *  /admin      → Admin (standalone admin panel — has its own layout)
 *
 * ThemeProvider wraps the entire app so dark-mode state is shared globally.
 */

import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AccessibilityProvider } from "./components/AccessibilityContext";
import { AccessibilityControls } from "./components/AccessibilityControls";
import { FloatingHelpButton } from "./components/FloatingHelpButton";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Parceiros from "./pages/Parceiros";
import Admin from "./pages/Admin";

/** Layout used by all "institutional" pages — Header + content + Footer + floating widgets. */
function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      {/* Floating accessibility panel — bottom-left */}
      <AccessibilityControls />
      {/* Floating help button + modal — bottom-right */}
      <FloatingHelpButton />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <BrowserRouter>
          <Routes>
            {/* Institutional site — shares global Header + Footer + floating widgets */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
            </Route>

            {/* Standalone pages — render their own layout */}
            <Route path="/parceiros" element={<Parceiros />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </BrowserRouter>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}

