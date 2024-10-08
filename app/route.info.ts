
import createRoute, { EmptyRouteParams } from "../route.config";

const HomePageRoute = createRoute({
  name: "home-page",
  paramsSchema: EmptyRouteParams,
  fn: () => "/",
})

export default HomePageRoute
