import { Effect } from "effect";

export const TS_CONFIG = "tsconfig.json";

export const ROUTE_CONFIG = "route.config.ts";
export const ROUTE_CONFIG_JS = "route.config.js";

export const ROUTE_INFO = "route.info.ts";
export const ROUTE_INFO_JS = "route.info.js";

export const TEMPEH_CONFIG = "tempeh.json";

export const NEXT_CONFIG_FILES = [
  "next.config.js",
  "next.config.ts",
  "next.config.mjs",
  "next.config.cjs",
];

export const PAGE_FILES = ["page.jsx", "page.tsx"];

// since next.js can either have a page or route handler, we only care about the ones that have pages.
export const hasPageInRoute = (directoryEntries: string[]) =>
  Effect.succeed(
    directoryEntries.findIndex((el) => PAGE_FILES.includes(el)) !== -1,
  );

export const hasRouteInfoInRoute = (directoryEntries: string[]) => {
  return Effect.succeed(
    directoryEntries.findIndex((el) =>
      [ROUTE_INFO, ROUTE_INFO_JS].includes(el),
    ) !== -1,
  );
};
