import { useSyncExternalStore } from "react";

export type Route = "/" | "/donate" | "/admin";

const ROUTES: Route[] = ["/", "/donate", "/admin"];

function current(): Route {
  const path = window.location.hash.replace(/^#/, "") || "/";
  return (ROUTES.includes(path as Route) ? path : "/") as Route;
}

const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

export const useRoute = () => useSyncExternalStore(subscribe, current);

export function navigate(route: Route) {
  if (current() === route) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    window.location.hash = route;
  }
}

/** Scrolls to a section of the home page, navigating there first if needed. */
export function goToSection(id: string) {
  const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (current() !== "/") {
    window.location.hash = "/";
    setTimeout(scroll, 80);
  } else {
    scroll();
  }
}
