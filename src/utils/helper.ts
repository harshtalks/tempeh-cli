import * as changeCase from "change-case";
import { Effect, pipe } from "effect";

// Notes
// 1. [slug], [...slug]. [[...slug]] - are the supported route params
// 2. (slug) - is not supported -> its just a route capture group, so we need to capture it, and remove from the route that.

export const extractRouteParams = (route: string) => {
  const params = route.match(
    /\[(?:\.\.\.)?[\w-]+\]|\[\[(?:\.\.\.)?[\w-]+\]\]/g,
  );

  return Effect.succeed(
    [...(params || ([] as string[]))].map((param) =>
      param.replace(/[\[\]\.]/g, ""),
    ),
  );
};

export const removeRouteCaptureGroups = (route: string, withSlash = true) => {
  return Effect.succeed(
    withSlash
      ? route.replace(/\([^)]+\)\//g, "")
      : route.replace(/\([^)]+\)/g, ""),
  );
};

export const hasRouteParams = (route: string) =>
  extractRouteParams(route).pipe(Effect.map((params) => params.length > 0));

export const replaceRouteParamsWithParams = (
  route: string,
  noInterPolate?: boolean,
) => {
  return removeRouteCaptureGroups(route).pipe(
    Effect.andThen((route) => {
      return Effect.succeed(
        route.replace(
          /\[(?:\.\.\.)?[\w-]+\]|\[\[(?:\.\.\.)?[\w-]+\]\]/g,
          (match) => {
            const paramName = match.replace(/[\[\]\.]/g, "");
            return noInterPolate ? `${paramName}` : `\${${paramName}}`;
          },
        ),
      );
    }),
  );
};

export const mapRouteParamsToZodSchema = (route: string) => {
  return extractRouteParams(route).pipe(
    Effect.map(
      (params) => `z.object({
      ${params.map((param) => `${param}: z.string()`).join(",\n    ")}
    })`,
    ),
  );
};

export const removeTrailingSlashes = (route: string) => {
  return Effect.succeed(route.replace(/\/+$/, ""));
};

export const addStartingSlash = (route: string) => {
  return Effect.succeed(route.replace(/^\/+/, "/"));
};
