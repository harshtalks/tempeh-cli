import { Context, Layer } from "effect";

export type Config = {
  isTs: boolean;
  routeConfigFileLocation: string;
  routesDir: "./app" | "./src/app";
};

export class TempehConfig extends Context.Tag("configStore")<
  TempehConfig,
  Config
>() {}

export const tempehConfigLive = Layer.succeed(
  TempehConfig,
  TempehConfig.of({
    isTs: false,
    routeConfigFileLocation: ".",
    routesDir: "./app",
  }),
);
