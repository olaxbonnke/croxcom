/**
 * Application feature flags and runtime configuration.
 * By default, SHOW_DEMO_DATA is false in production so mock personas are hidden
 * unless explicitly enabled via environment variable VITE_SHOW_DEMO_DATA="true".
 */
export const SHOW_DEMO_DATA = import.meta.env.VITE_SHOW_DEMO_DATA === "true";
