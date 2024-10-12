import createRoute, { EmptyRouteParams } from "../../confug/route.config";

const WorkspacesPageRoute = createRoute({
  name: "/workspaces",
  paramsSchema: EmptyRouteParams,
  fn: () => "/workspaces",
});

export default WorkspacesPageRoute;
