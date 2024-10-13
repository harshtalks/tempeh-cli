// Init SubCommand
// This command is used to initialize the project with the required files and folders
// important things-
// 1. we need to generate tempeh.json file. It will have three things
// - location of route.config.ts file
// - location of routes, in Next.js >= 13, it can be in the ./app or ./src/app
// - version of the cli
// - whether ts is used. use tsconfig.json file to determine this.
// TODO add more if we miss
// 2. We need to make sure we are in a Next.js project. do this with next.config.js/next.config.ts file

import { Command, Prompt } from "@effect/cli";
import { Path } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";
import { Effect } from "effect";
import {
  addRoutes,
  checkDependencies,
  createRouteConfig,
  createTempehConfig,
  isValidNextProject,
} from "../utils/file";
import { prettierLive } from "../deps/prettier";
import TempehConfig, {
  initialState,
  setConfig,
  TempehSchema,
} from "../deps/config";

/*
 route config by default will be in the root of the project.
 User can change it to any location they want.
*/
const routeConfigFileLocation = Prompt.text({
  message: "Enter the location of the route.config.ts file",
  default: ".",
});

/**
 We can have the routes in two locations
    1. Without src
    2. With src
*/

const routesLocatioon = Prompt.select({
  message: "Select the location of the routes",
  choices: [
    {
      value: "./app",
      title: "Without src",
      description: "This is the location of the routes folder without the src",
    },
    {
      value: "./src/app",
      title: "With src",
      description: "This is the location of the routes folder with the src",
    },
  ],
});

const hasTypescript = Prompt.toggle({
  message: "Is the project using typescript?",
  initial: true,
  active: "Yes",
  inactive: "No",
});

const initCmdPrompts = Prompt.all({
  hasTypescript,
  routeConfigFileLocation,
  routesLocatioon,
});

const initCmd = Command.prompt("init" as const, initCmdPrompts, (prompts) => {
  return isValidNextProject.pipe(
    Effect.andThen(() => {
      return setConfig({
        isTs: prompts.hasTypescript,
        routeConfigFileLocation: prompts.routeConfigFileLocation,
        routesDir: prompts.routesLocatioon,
      } as TempehSchema);
    }),
    // check if we need to add any dependencies - zod/tempeh
    Effect.andThen(checkDependencies),
    // create tempeh.json file
    Effect.andThen(createTempehConfig),
    // create route.config.ts/js file
    Effect.andThen(createRouteConfig),
    // add routes to the app directory
    Effect.andThen(addRoutes),
    // providing services
    Effect.provideServiceEffect(TempehConfig, initialState),
    Effect.provide(prettierLive),
    Effect.provide(NodeFileSystem.layer),
    Effect.provide(Path.layer),
  );
}).pipe(
  Command.withDescription(
    "initialize the project with the required files and folders, adds declarative routing objects to the project.",
  ),
);

export default initCmd;
