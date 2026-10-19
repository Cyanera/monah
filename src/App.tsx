import { useEffect } from "react";
import { Footer, Header } from "./components/Layout";
import { Toaster } from "./components/ui";
import { Admin } from "./pages/Admin";
import { Donate } from "./pages/Donate";
import { Home } from "./pages/Home";
import { useRoute } from "./lib/router";

const TITLES = {
  "/": "مُونة | من فائض النعمة، نصنع الكفاية",
  "/donate": "ساهم بفائض الطعام | مُونة",
  "/admin": "لوحة الإدارة التجريبية | مُونة",
} as const;

export default function App() {
  const route = useRoute();

  useEffect(() => {
    document.title = TITLES[route];
    // Section links on the home page set their own scroll; other route changes start at the top.
    if (route !== "/") window.scrollTo({ top: 0 });
  }, [route]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault(); // a real #main hash would collide with the hash router
          document.getElementById("main")?.focus();
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-lg focus:bg-white focus:p-3">
        تخطَّ إلى المحتوى
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {route === "/" && <Home />}
        {route === "/donate" && <Donate />}
        {route === "/admin" && <Admin />}
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
