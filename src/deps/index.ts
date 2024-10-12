import { FileSystem, Path } from "@effect/platform";
import { Effect, Ref } from "effect";
import TempehConfig from "./config";

const injectDependencies = Effect.all([
  FileSystem.FileSystem,
  Path.Path,
  TempehConfig,
]).pipe(
  Effect.andThen(([fs, path, config]) =>
    Ref.get(config).pipe(
      Effect.andThen((config) => ({
        fs,
        path,
        config,
      })),
    ),
  ),
);

export default injectDependencies;
