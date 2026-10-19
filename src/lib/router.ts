import { useSyncExternalStore } from "react";

export type Route = "/" | "/donate" | "/admin";

const ROUTES: Route[] = ["/", "/donate", "/admin"];

// The single-file preview build runs inside a sandboxed frame where the URL hash is
// not usable, so it keeps the route in memory instead (VITE_MEMORY_ROUTER=1).
const MEMORY = import.meta.env.VITE_MEMORY_ROUTER === "1";
let memoryRoute: Route = "/";
const memoryListeners = new Set<() => void>();

function current(): Route {
  if (MEMORY) return memoryRoute;
  const path = window.location.hash.replace(/^#/, "") || "/";
  return (ROUTES.includes(path as Route) ? path : "/") as Route;
}

function setRoute(route: Route) {
  if (MEMORY) {
    memoryRoute = route;
    memoryListeners.forEach((l) => l());
  } else {
    window.location.hash = route;
  }
}

const subscribe = (cb: () => void) => {
  if (MEMORY) {
    memoryListeners.add(cb);
    return () => memoryListeners.delete(cb);
  }
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

export const useRoute = () => useSyncExternalStore(subscribe, current);

export function navigate(route: Route) {
  if (current() === route) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    setRoute(route);
  }
}

/** Scrolls to a section of the home page, navigating there first if needed. */
export function goToSection(id: string) {
  const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (current() !== "/") {
    setRoute("/");
    setTimeout(scroll, 80);
  } else {
    scroll();
  }
}
