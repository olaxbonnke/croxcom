import { useLocation } from "@tanstack/react-router";

// Routes where the compose/new-post button should be visible
const COMPOSER_VISIBLE_ROUTES = ["/", "/library", "/browse", "/bookmarks"];

export function useComposerVisibility(): boolean {
  const location = useLocation();
  return COMPOSER_VISIBLE_ROUTES.some((route) =>
    route === "/" ? location.pathname === "/" : location.pathname.startsWith(route),
  );
}
