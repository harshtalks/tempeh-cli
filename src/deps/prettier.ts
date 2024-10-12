// Prettier service
import { Context, Effect, Layer } from "effect";
import { format, type Options } from "prettier";
import { FormattingError } from "../utils/errors";

export const formatFile = (source: string, options: Options) =>
  Effect.tryPromise({
    try: () => format(source, options),
    catch: (e) =>
      new FormattingError(
        e instanceof Error ? e.message : "Unknown error during formatting",
      ),
  });

export class Prettier extends Context.Tag("prettier")<
  Prettier,
  typeof formatFile
>() {}

export const prettierLive = Layer.succeed(Prettier, Prettier.of(formatFile));
