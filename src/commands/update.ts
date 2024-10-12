// Second Command.
// This is a command that will be used afterwards to add new routes to the project.
// In this state, we already have established the project structure and the route.config.ts file.

import { Console, Effect } from "effect";
import injectDependencies from "../deps";
import { TEMPEH_CONFIG } from "../utils/constants";
import { UnInitializedProject } from "../utils/errors";
import TempehConfig, { initialState, setConfig } from "../deps/config";
import { Command } from "@effect/cli";
import { NodeFileSystem } from "@effect/platform-node";
import { prettierLive } from "../deps/prettier";
import { Path } from "@effect/platform";
import { addRoutes } from "../utils/file";

// Readng and setting up the tempeh config.
const readTempehConfig = injectDependencies.pipe(
  Effect.andThen(({ fs, path, config }) => {
    const filePath = path.join(process.cwd(), TEMPEH_CONFIG);
    return fs.readFileString(filePath).pipe(
      Effect.catchTag("SystemError", () => {
        return Effect.fail(
          new UnInitializedProject(
            "😭 Looks like you have not initialized the project. please run init command first",
          ),
        );
      }),
      Effect.andThen((file) => JSON.parse(file) as unknown),
      Effect.andThen(setConfig),
      Effect.andThen(() =>
        Console.log("🧀 Routes found in " + config.routesDir + " directory."),
      ),
    );
  }),
);

const updateCmd = Command.make("update", {}, () => {
  return readTempehConfig.pipe(
    // add routes to the routes directory
    Effect.andThen(addRoutes),
    // providing services
    Effect.provideServiceEffect(TempehConfig, initialState),
    // file system
    Effect.provide(NodeFileSystem.layer),
    // prettier formatting
    Effect.provide(prettierLive),
    // path config
    Effect.provide(Path.layer),
  );
});

export default updateCmd;
