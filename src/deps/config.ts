import { Context, Effect, Layer, Ref } from "effect";
import { Schema } from "@effect/schema";
import { InvalidTempehConfig } from "../utils/errors";

export const TempehSchema = Schema.Struct({
  isTs: Schema.Boolean,
  routeConfigFileLocation: Schema.Trimmed,
  routesDir: Schema.Literal("./app", "./src/app"),
});

export type TempehSchema = Schema.Schema.Type<typeof TempehSchema>;

// Create a Tag for our state
class TempehConfig extends Context.Tag("MyState")<
  TempehConfig,
  Ref.Ref<TempehSchema>
>() {}

export const initialState = Ref.make<TempehSchema>({
  isTs: true,
  routeConfigFileLocation: ".",
  routesDir: "./app",
});

export const setConfig = (config: unknown) =>
  Effect.gen(function* () {
    const ref = yield* TempehConfig;
    const decoded = yield* Schema.decodeUnknown(TempehSchema)(config);
    yield* Ref.update(ref, () => ({
      isTs: decoded.isTs,
      routeConfigFileLocation: decoded.routeConfigFileLocation,
      routesDir: decoded.routesDir,
    }));
  }).pipe(
    Effect.catchTag("ParseError", () =>
      Effect.fail(
        new InvalidTempehConfig(
          "😭 Tempeh config file is not valid. Please revert the changes if you have made any.",
        ),
      ),
    ),
  );

export default TempehConfig;
