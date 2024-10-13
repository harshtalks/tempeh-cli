#!/usr/bin/env node

// We are finally introducing the CLI tio make this easier for a lot of yall to initiate tempeh in a project.
/*
  The CLI will have the following commands:
  1. tempeh init - This will create a route.config.ts file in the root of the project. It will have t he instance of routeBuilder needed to create routes, navigate and other hooks stuff. It will then also create route.info.ts for each route in next.js app directory. very simple backbone route with empty params schema. Users can then modify the route.info.ts file to add more complex params schema.
  2. tempeh update - run when you have generated more pages since the last time you ran the CLI. This will update the route.info.ts files with the new routes.
  3. Cool bit - if the page has dybnnamic params, The CLI will make adjustment to the route.info.ts file to include the params schema for the route.
  More on this later.
*/

import { NodeContext, NodeRuntime } from "@effect/platform-node";
import initCmd from "./commands/init";
import { Command } from "@effect/cli";
import { Effect } from "effect";
import updateCmd from "./commands/update";

// we need three subcommands
// - init
// - watch

// it is a very basic CLI, good learning for me.

const command = Command.make("tempeh")
  .pipe(Command.withSubcommands([updateCmd, initCmd]))
  .pipe(
    Command.withDescription(
      "Tempeh is a CLI tool to help you manage your routes in Next.js with tempeh library and zod.",
    ),
  );

const cli = Command.run(command, {
  name: "tempeh",
  version: "0.0.1",
});

cli(process.argv).pipe(
  Effect.orDie,
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain,
);
