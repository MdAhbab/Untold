import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { AnimatePresence } from "motion/react";
import { AppProvider, AppDataProvider } from "./lib/store";
import { Nav, Footer, CurtainTransition } from "./components/layout/Chrome";
import { Landing } from "./pages/Landing";
import { Builder } from "./pages/Builder";
import { Assembling } from "./pages/Assembling";
import { Reveal } from "./pages/Reveal";
import { Taste } from "./pages/Taste";
import { Collection } from "./pages/Collection";
import { Trade } from "./pages/Trade";
import { Account } from "./pages/Account";
import { Embed } from "./pages/Embed";
import { NotFound } from "./pages/NotFound";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  const hideChrome = location.pathname === "/assembling";
  return (
    <>
      <ScrollToTop />
      <AnimatePresence>
        <CurtainTransition key={location.pathname} id={location.pathname} />
      </AnimatePresence>
      {!hideChrome && <Nav />}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/build" element={<Builder />} />
        <Route path="/assembling" element={<Assembling />} />
        <Route path="/reveal" element={<Reveal />} />
        <Route path="/taste" element={<Taste />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/trade" element={<Trade />} />
        <Route path="/account" element={<Account />} />
        <Route path="/embed" element={<Embed />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideChrome && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AppDataProvider>
      <AppProvider>
        <BrowserRouter>
          <div className="min-h-screen">
            <AnimatedRoutes />
          </div>
        </BrowserRouter>
      </AppProvider>
    </AppDataProvider>
  );
}
