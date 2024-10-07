import { Effect, Either } from "effect";
import injectDependencies from "../deps";
import { MissingDeoendencies, NextError } from "./errors";
import {
  NEXT_CONFIG,
  NEXT_CONFIG_JS,
  ROUTE_CONFIG,
  ROUTE_INFO,
  ROUTE_INFO_JS,
  TEMPEH_CONFIG,
  TS_CONFIG,
} from "./constants";
import {
  routeConfigContent,
  routeInfoContent,
  routeInfoContentBase,
} from "./content";
import { FileSystem, Path } from "@effect/platform";
import { TempehConfig } from "../deps/config";

// check if the tempeh and zod is installed
export const checkDependencies = injectDependencies
  .pipe(
    Effect.andThen(({ fs, path }) => {
      // read package.json
      const packageJsonPath = path.join(process.cwd(), "package.json");
      const packageJson = fs.readFileString(packageJsonPath);
      return packageJson;
    }),
  )
  .pipe(
    Effect.andThen(JSON.parse),
    Effect.andThen((packageJsonJSON) => {
      // @ts-ignore
      const deps = packageJsonJSON["dependencies"];
      if ("tempeh" in deps && "zod" in deps) {
        return Effect.succeed(true);
      } else {
        return Effect.fail(
          new MissingDeoendencies(
            "Tempeh and Zod not installed. Please install them before running this command.",
          ),
        );
      }
    }),
  );

// check if the project is a next.js project
export const isValidNextProject = injectDependencies.pipe(
  Effect.andThen(({ fs, path, config }) => {
    return fs.exists(path.join(process.cwd(), TS_CONFIG)).pipe(
      Effect.andThen((isTs) => {
        config.isTs = isTs;

        const pathToNextConfig = config.isTs ? NEXT_CONFIG : NEXT_CONFIG_JS;

        return fs.exists(path.join(process.cwd(), pathToNextConfig)).pipe(
          Effect.andThen((hasNextConfig) => {
            if (!hasNextConfig) {
              return Effect.fail(new NextError("Next config not found"));
            }
            return Effect.succeed(config);
          }),
        );
      }),
    );
  }),
);

// on the root create a file called tempeh.json
// it's always in the root of the project
export const createTempehConfig = injectDependencies.pipe(
  Effect.andThen(({ fs, path, config }) => {
    const filePath = path.join(process.cwd(), TEMPEH_CONFIG);
    return fs.writeFileString(filePath, JSON.stringify(config, null, 2));
  }),
);

// now generate the route.config.ts file
// since it can be anywhere in the project, we need to generate folders if user has not opted for a specific location - root
export const createRouteConfig = injectDependencies.pipe(
  Effect.andThen(({ fs, path, config }) => {
    const givenPath = path.join(process.cwd(), config.routeConfigFileLocation);
    return fs.exists(givenPath).pipe(
      Effect.andThen((value) => {
        if (value) {
          const routeConfigFile = path.join(
            givenPath,
            config.isTs ? ROUTE_CONFIG : ROUTE_INFO_JS,
          );
          return fs.writeFileString(routeConfigFile, routeConfigContent);
        } else {
          return fs.makeDirectory(givenPath, { recursive: true }).pipe(
            Effect.andThen(() => {
              const routeConfigFile = path.join(
                givenPath,
                config.isTs ? ROUTE_CONFIG : ROUTE_INFO_JS,
              );
              return fs.writeFileString(routeConfigFile, routeConfigContent);
            }),
          );
        }
      }),
    );
  }),
);

// add the routes in the ROUTE_INFO file
export const addRoutes = injectDependencies.pipe(
  Effect.andThen(({ fs, path, config }) => {
    // we are in the routes dir
    const workingDirectory = path.join(process.cwd(), config.routesDir);
    // route config
    const routeConfig = path.join(
      process.cwd(),
      config.routeConfigFileLocation,
    );
    // relative import location
    const relativeImportLocation = path.relative(workingDirectory, routeConfig);

    const importLocation = path.join(relativeImportLocation, "route.config");
    const importLocationValid = importLocation.startsWith(".")
      ? importLocation
      : `./${importLocation}`;

    // add the route info
    return createRouteFile({
      base: { isBase: true },
      workingDirectory,
    }).pipe(
      Effect.andThen(() => {
        const dirs = fs.readDirectory(workingDirectory);
        return dirs.pipe(
          Effect.andThen((dirs) => {
            return Effect.forEach(dirs, (d) =>
              readDirectoryAndAddRoutes(workingDirectory, d),
            );
          }),
        );
      }),
    );

    // now we will have to read all the directories in the working directory
  }),
);

const createRouteFile = ({
  base,
  workingDirectory,
}: {
  workingDirectory: string;
  base: { isBase: true } | { isBase: false; routeName: string };
}) => {
  return injectDependencies.pipe(
    Effect.andThen(({ fs, path, config }) => {
      const relativeImportLocation = path.relative(
        workingDirectory,
        path.join(process.cwd(), config.routeConfigFileLocation),
      );

      const importLocation = path.join(relativeImportLocation, "route.config");
      const importLocationValid = importLocation.startsWith(".")
        ? importLocation
        : `./${importLocation}`;

      return fs.writeFileString(
        path.join(workingDirectory, config.isTs ? ROUTE_INFO : ROUTE_INFO_JS),
        base.isBase
          ? routeInfoContentBase(importLocationValid)
          : routeInfoContent(importLocationValid, base.routeName),
      );
    }),
  );
};

// recursive sum

const readDirectoryAndAddRoutes = (initialPrefix: string, initialDir: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const config = yield* TempehConfig;

    // Stack to keep track of directories to process
    const dirStack: Array<[string, string]> = [[initialPrefix, initialDir]];

    while (dirStack.length > 0) {
      const [prefix, dir] = dirStack.pop()!;
      const directory = path.join(prefix, dir);
      const dirsResult = yield* Effect.either(fs.readDirectory(directory));

      if (Either.isRight(dirsResult)) {
        const entries = dirsResult.right;

        // check if the directory has a page.tsx file
        const hasPage = entries.includes("page.tsx");
        if (hasPage) {
          // add the route to the route.config file
          const routeName = directory.split("/").pop();
          const routePath = directory;

          if (routeName) {
            yield* createRouteFile({
              base: { isBase: false, routeName },
              workingDirectory: directory,
            });
          }
        }

        // Process each entry in the current directory
        for (const entry of entries) {
          const fullPath = path.join(directory, entry);
          // Try to read the entry as if it were a directory
          const subDirResult = yield* Effect.either(fs.readDirectory(fullPath));

          if (Either.isRight(subDirResult)) {
            // If we can read it as a directory, add it to the stack
            dirStack.push([directory, entry]);
          }
        }
      }
    }
  });
