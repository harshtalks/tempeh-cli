// Second Command.
// This is a command that will be used afterwards to add new routes to the project.
// In this state, we already have established the project structure and the route.config.ts file.

import { Effect } from "effect";
import injectDependencies from "../deps";
import { TEMPEH_CONFIG } from "../utils/constants";
import { InvalidTempehConfig, UnInitializedProject } from "../utils/errors";
import { TempehSchema } from "../deps/config";
import { Schema } from "@effect/schema";

const readTempehConfig = injectDependencies.pipe(
  Effect.andThen(({ config, fs, path }) => {
    const filePath = path.join(process.cwd(), TEMPEH_CONFIG);
    return fs.readFileString(filePath).pipe(
      Effect.catchTag("SystemError", () => {
        return Effect.fail(
          new UnInitializedProject(
            "😭 Looks like you have not initialized the project. please run init command first",
          ),
        );
      }),
      Effect.andThen((file) => {
        return Schema.decodeUnknown(TempehSchema)(file);
      }),
      Effect.catchTag("ParseError", () => {
        return Effect.fail(
          new InvalidTempehConfig(
            "😭 Tempeh config file is not valid. Please revert the changes if you have made any.",
          ),
        );
      }),
      Effect.andThen((decoded) => {
        config.isTs = decoded.isTs;
        config.routeConfigFileLocation = decoded.routeConfigFileLocation;
      }),
    );
  }),
);

const hasInitRun = injectDependencies.pipe(
  Effect.andThen(({ config, fs, path }) => {}),
);
