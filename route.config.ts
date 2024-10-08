
import { routeBuilder } from "tempeh";
import { void as _void } from "zod";

const { createRoute, useTempehRouter, Navigate } = routeBuilder.getInstance({
  // zod errors are often hard to read, this option allows u to make your zod validation errors more readable.
  formattedValidationErrors: true,
  // default base url set to "/", you not need to change it almost
  defaultBaseUrl: "/",
});

// Since all our routes accept a required `paramsSchema`, this will be a good place to define an empty schema for routes that do not require any params.
// You can later change this to a more complex schema if you need to.
// If your route has a dynamic param, cli will infer the schema for the params from the route itself. thank you zod.
const EmptyRouteParams = _void();

export { useTempehRouter, Navigate, EmptyRouteParams };

export default createRoute;
