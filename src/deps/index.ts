import { FileSystem, Path } from "@effect/platform";
import { Effect } from "effect";
import { TempehConfig } from "./config";

const injectDependencies = Effect.all([
  FileSystem.FileSystem,
  Path.Path,
  TempehConfig,
]).pipe(Effect.andThen(([fs, path, config]) => ({ fs, path, config })));

export default injectDependencies;
