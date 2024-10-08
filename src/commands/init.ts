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
import { Path, FileSystem } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";
import { Console, Effect } from "effect";
import { TS_CONFIG } from "../utils/constants";
import {
  addRoutes,
  checkDependencies,
  createRouteConfig,
  createTempehConfig,
  isValidNextProject,
} from "../utils/file";
import { tempehConfigLive } from "../deps/config";

class TSConfgNotFoundError extends Error {
  _tag = "TSConfgNotFoundError";
}

export const checkNextJsProject = Effect.all([FileSystem.FileSystem, Path.Path])
  .pipe(
    Effect.andThen(([fs, path]) => {
      const isTsProject = fs.exists(path.join(process.cwd(), TS_CONFIG));
      return isTsProject
        ? Effect.succeed(true)
        : Effect.fail(new TSConfgNotFoundError("Not a Next.js project"));
    }),
  )
  .pipe(Effect.provide(Path.layer), Effect.provide(NodeFileSystem.layer));

// prompt for the location of the route.config.ts file

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

const initCmd = Command.prompt("init", initCmdPrompts, (prompts) => {
  return isValidNextProject.pipe(
    Effect.andThen((config) => {
      config.isTs = prompts.hasTypescript;
      config.routeConfigFileLocation = prompts.routeConfigFileLocation;
      config.routesDir = prompts.routesLocatioon as "./app" | "./src/app";

      return config;
    }),
    Effect.andThen(checkDependencies),
    Effect.andThen(createTempehConfig),
    Effect.andThen(createRouteConfig),
    Effect.andThen(addRoutes),
    Effect.provide(tempehConfigLive),
    Effect.provide(NodeFileSystem.layer),
    Effect.provide(Path.layer),
  );
});

export default initCmd;
