import createRoute from "../../../confug/route.config";
import * as z from "zod";

const WorkspaxceIdPageRoute = createRoute({
  name: "workspaces/${workspaxce_id}",
  paramsSchema: z.object({
    workspaxce_id: z.string(),
  }),
  fn: ({ workspaxce_id }) => `/workspaces/${workspaxce_id}`,
});

export default WorkspaxceIdPageRoute;
