import * as changeCase from "change-case";
import { Effect } from "effect";

export const extractRouteParams = (route: string) => {
  const params = route.match(/\[(?:\.\.\.)?\w*\]|\[\[\w*\]\]/g);

  return Effect.succeed(
    [...(params || ([] as string[]))].map((param) =>
      param.replace(/[\[\]\.]/g, ""),
    ),
  );
};

export const hasRouteParams = (route: string) =>
  extractRouteParams(route).pipe(Effect.map((params) => params.length > 0));

export const replaceRouteParamsWithParams = (
  route: string,
  noInterPolate?: boolean,
) => {
  return Effect.succeed(
    route.replace(/\[(?:\.\.\.)?([^\]]+)\]|\[\[([^\]]+)\]\]/g, (_, p1, p2) => {
      const param = p1 || p2;
      return noInterPolate
        ? `${changeCase.camelCase(param.replace(/[-_]+/g, " "))}`
        : `\${${param.replace(/[]+/g, " ")}}`;
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
