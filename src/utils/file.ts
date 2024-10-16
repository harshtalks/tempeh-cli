import { Console, Effect, Either, Ref } from "effect";
import injectDependencies from "../deps";
import {
  InvalidRoutesDir,
  NextError,
  ProjectAlreadyInitialized,
} from "./errors";
import {
  hasPageInRoute,
  hasRouteInfoInRoute,
  NEXT_CONFIG_FILES,
  ROUTE_CONFIG,
  ROUTE_INFO,
  ROUTE_INFO_JS,
  TEMPEH_CONFIG,
} from "./constants";
import {
  routeConfigContent,
  routeInfoContent,
  RouteInfoContentArgs,
  routeInfoContentBase,
} from "./content";
import { FileSystem, Path } from "@effect/platform";
import TempehConfig from "../deps/config";
import { PackageJson } from "type-fest";
import ora from "ora";
import { installMissingDependency } from "./packages";
import {
  addStartingSlash,
  extractRouteParams,
  hasRouteParams,
  mapRouteParamsToZodSchema,
  removeRouteCaptureGroups,
  removeTrailingSlashes,
  replaceRouteParamsWithParams,
} from "./helper";
import { Prettier } from "../deps/prettier";

// check if the tempeh and zod is installed
export const checkDependencies = injectDependencies.pipe(
  Effect.andThen(({ fs, path }) => {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    return fs.readFileString(packageJsonPath).pipe(
      Effect.andThen((v) => JSON.parse(v) as unknown as PackageJson),
      Effect.andThen((packageJson) => {
        const deps = packageJson.dependencies || {};
        const missingDeps = ["tempeh", "zod"].filter((dep) => !(dep in deps));

        if (missingDeps.length === 0) {
          return Effect.succeed(true);
        } else {
          return installMissingDependency(
            ...missingDeps.map((el) => `${el}@latest`),
          );
        }
      }),
    );
  }),
);

// check if the project is a next.js project
export const isValidNextProject = injectDependencies.pipe(
  Effect.andThen(({ fs, path, config }) => {
    return fs.readDirectory(process.cwd()).pipe(
      Effect.map((files) =>
        files.some((file) => NEXT_CONFIG_FILES.includes(file)),
      ),
      Effect.andThen((isNextProject) =>
        isNextProject
          ? Effect.succeed(config)
          : Effect.fail(
              new NextError(
                "This is not a Next.js project. Please run this command in a Next.js project.",
              ),
            ),
      ),
    );
  }),
);

// on the root create a file called tempeh.json
// it's always in the root of the project
export const createTempehConfig = injectDependencies.pipe(
  Effect.andThen(({ fs, path, config }) => {
    const filePath = path.join(process.cwd(), TEMPEH_CONFIG);
    return fs.readFileString(filePath).pipe(
      Effect.andThen((file) => {
        return Effect.fail(
          new ProjectAlreadyInitialized("😭 Tempeh config file already exists"),
        );
      }),
      Effect.catchTag("SystemError", () => {
        return fs.writeFileString(filePath, JSON.stringify(config, null, 2));
      }),
    );
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
              return Prettier.pipe(
                Effect.andThen((format) =>
                  format(routeConfigContent, {
                    parser: config.isTs ? "typescript" : "babel",
                  }),
                ),
              ).pipe(
                Effect.andThen((content) =>
                  fs.writeFileString(routeConfigFile, content),
                ),
                Effect.andThen(() =>
                  Console.log(
                    `🧀 Route.config file is created at the ${routeConfigFile}`,
                  ),
                ),
              );
            }),
          );
        }
      }),
    );
  }),
);

// add the routes in the ROUTE_INFO file
export const addRoutes = injectDependencies.pipe(
  Effect.andThen(({ fs, config, path }) => {
    return fs
      .exists(path.join(process.cwd(), config.routesDir))
      .pipe(
        Effect.andThen((bool) =>
          bool
            ? readDirectoryAndAddRoutes(process.cwd(), config.routesDir)
            : Effect.fail(
                new InvalidRoutesDir("Routes directory does not exist"),
              ),
        ),
      );
  }),
);

// Decide which type of route needs to be added. base route is different in the sense how it is created.
const createRouteFile = ({
  base,
  workingDirectory,
}: {
  workingDirectory: string;
  base:
    | { isBase: true }
    | (Omit<RouteInfoContentArgs, "path"> & { isBase: false });
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

      return Prettier.pipe(
        Effect.andThen((format) => {
          return format(
            base.isBase
              ? routeInfoContentBase(importLocationValid)
              : routeInfoContent({
                  ...base,
                  path: importLocationValid,
                }),
            {
              parser: config.isTs ? "typescript" : "babel",
            },
          );
        }),
      ).pipe(
        Effect.andThen((content) =>
          fs.writeFileString(
            path.join(
              workingDirectory,
              config.isTs ? ROUTE_INFO : ROUTE_INFO_JS,
            ),
            content,
          ),
        ),
        Effect.andThen(() =>
          Console.log(`🧀 New route created at ${workingDirectory}`),
        ),
      );
    }),
  );
};

// simpler route - no params
const CreateSimpleRoute = (routeName: string, routePath: string) =>
  Effect.all([
    removeRouteCaptureGroups(routeName, false),
    removeRouteCaptureGroups(routePath, true).pipe(
      Effect.andThen((route) => removeRouteCaptureGroups(route, false)),
      Effect.andThen(addStartingSlash),
      Effect.andThen(removeTrailingSlashes),
    ),
  ]).pipe(
    Effect.andThen(([routeName, routePath]) =>
      Effect.succeed({
        isBase: false,
        name: routeName,
        routeFn: `() => "/${routePath}"`,
        routeFnResult: `/${routePath}`,
      } as Omit<RouteInfoContentArgs, "path"> & { isBase: false }),
    ),
  );

// routes with parameters
const CreateParamRoute = (routeName: string, routePath: string) =>
  Effect.all([
    replaceRouteParamsWithParams(routePath).pipe(
      Effect.andThen(addStartingSlash),
      Effect.andThen(removeTrailingSlashes),
    ),
    createParameterizedRoutePath(routePath),
    mapRouteParamsToZodSchema(routePath),
    replaceRouteParamsWithParams(routeName, true),
  ]).pipe(
    Effect.andThen(
      ([routeFnResult, routeFn, paramsSchema, routeName]) =>
        ({
          name: routeName,
          isBase: false,
          routeFn: routeFn,
          routeFnResult: routeFnResult,
          paramsSchema: paramsSchema,
        }) as Omit<RouteInfoContentArgs, "path"> & { isBase: false },
    ),
  );

// get the path with parameters
const createParameterizedRoutePath = (RoutePath: string) =>
  Effect.gen(function* () {
    const InterpolatedPath = yield* replaceRouteParamsWithParams(
      RoutePath,
    ).pipe(
      Effect.andThen(addStartingSlash),
      Effect.andThen(removeTrailingSlashes),
    );
    const ExtractedParams = yield* extractRouteParams(RoutePath);
    return `(${`{${ExtractedParams.join(", ")}}`}) => ${"`" + `/${InterpolatedPath}` + "`"}`;
  });

// finally add the route to the route.config file
const readDirectoryAndAddRoutes = (initialPrefix: string, initialDir: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const tempehConfig = yield* TempehConfig;
    const config = yield* Ref.get(tempehConfig);

    // Stack to keep track of directories to process
    const dirStack: Array<[string, string]> = [[initialPrefix, initialDir]];
    let newRoutesInfoAdded = false;

    while (dirStack.length > 0) {
      const [prefix, dir] = dirStack.pop()!;
      const directory = path.join(prefix, dir);
      const dirsResult = yield* Effect.either(fs.readDirectory(directory));

      if (Either.isRight(dirsResult)) {
        const entries = dirsResult.right;

        // check if the directory has a page.tsx file. also check if the route is already there
        // We dont want to add the same route again
        const hasPage = yield* hasPageInRoute(entries);
        const routeAlreadyThere = yield* hasRouteInfoInRoute(entries);

        if (hasPage && !routeAlreadyThere) {
          // add the route to the route.config file

          const routeName = directory.split("/").pop();

          const routePath = path.relative(
            path.join(process.cwd(), config.routesDir),
            directory,
          );

          if (routeName) {
            const hasParams = yield* hasRouteParams(routePath);

            const baseRoute = hasParams
              ? yield* CreateParamRoute(routeName, routePath)
              : yield* CreateSimpleRoute(routeName, routePath);

            yield* createRouteFile({
              base: baseRoute,
              workingDirectory: directory,
            });

            newRoutesInfoAdded = true;
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

    if (!newRoutesInfoAdded) {
      yield* Console.log(
        "🧀 No new routes added. Every page already has a route info set up.",
      );
    }
  });
