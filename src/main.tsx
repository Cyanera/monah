import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Set in code as well as in index.html so direction holds when the app is embedded
// in a host page that supplies its own <html> element.
document.documentElement.lang = "ar";
document.documentElement.dir = "rtl";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
