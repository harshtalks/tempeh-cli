import * as changeCase from "change-case";

export const extractRouteParams = (route: string) => {
  const params = route.match(/\[(?:\.\.\.)?\w*\]|\[\[\w*\]\]/g);
  if (!params) {
    return [];
  }
  return params
    .map((param) => param.replace(/[\[\]\.]/g, ""))
    .map((el) => changeCase.camelCase(el));
};

export const hasRouteParams = (route: string) => {
  return extractRouteParams(route).length > 0;
};

export const replaceRouteParamsWithParams = (
  route: string,
  noInterPolate?: boolean,
) => {
  return route.replace(
    /\[(?:\.\.\.)?([^\]]+)\]|\[\[([^\]]+)\]\]/g,
    (_, p1, p2) => {
      const param = p1 || p2;
      return noInterPolate
        ? `${changeCase.camelCase(param.replace(/[-_]+/g, " "))}`
        : `\${${changeCase.camelCase(param.replace(/[-_]+/g, " "))}}`;
    },
  );
};

export const mapRouteParamsToZodSchema = (route: string): string => {
  const params = extractRouteParams(route);
  return `z.object({
    ${params.map((param) => `${param}: z.string()`).join(",\n    ")}
  })`;
};
