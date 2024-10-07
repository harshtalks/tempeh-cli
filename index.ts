// We are finally introducing the CLI tio make this easier for a lot of yall to initiate tempeh in a project.
/*
  The CLI will have the following commands:
  1. tempeh init - This will create a route.config.ts file in the root of the project. It will have t he instance of routeBuilder needed to create routes, navigate and other hooks stuff. It will then also create route.info.ts for each route in next.js app directory. very simple backbone route with empty params schema. Users can then modify the route.info.ts file to add more complex params schema.
  2. tempeh watch - if new routes are added. the CLI will watch for changes in the folder structure and make new routes
  3. tempeh update - run when you have generated more pages since the last time you ran the CLI. This will update the route.info.ts files with the new routes.
  4. Cool bit - if the page has dybnnamic params, The CLI will make adjustment to the route.info.ts file to include the params schema for the route.
  More on this later.
*/

import { NodeContext, NodeRuntime } from "@effect/platform-node";
import initCmd, { checkNextJsProject } from "./src/commands/init";
import { Command } from "@effect/cli";
import { Effect } from "effect";

// we need three subcommands
// - init
// - watch
// - update

// it is a very basic CLI, good learning for me.

const command = Command.make("tempeh").pipe(Command.withSubcommands([initCmd]));

const cli = Command.run(command, {
  name: "tempeh",
  version: "0.0.1",
});

cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain);

// Learning notes
// 1. we need a runtime
// 2. we need to provide a context to our runtime
// 3. we also need to provide args to our command
