import { detect } from "@antfu/ni";
import { Effect } from "effect";

export const getPackageManager = (cwd: string) =>
  Effect.gen(function* (_) {
    const packageManager = yield* _(
      Effect.promise(() => detect({ programmatic: true, cwd })),
    );

    return yield* _(
      Effect.succeed(
        (() => {
          switch (packageManager) {
            case "yarn@berry":
              return "yarn" as const;
            case "pnpm@6":
              return "pnpm" as const;
            case "bun":
              return "bun" as const;
            default:
              return packageManager ?? ("npm" as const);
          }
        })(),
      ),
    );
  });
