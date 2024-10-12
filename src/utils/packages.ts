// for installing missing dependencies

import { Effect } from "effect";
import ora from "ora";
import { getPackageManager } from "./package-manager";
import { Command } from "@effect/platform";

export const installMissingDependency = (...packageNames: string[]) =>
  Effect.gen(function* (_) {
    // start the spinner
    const spinner = yield* Effect.succeed(
      ora(
        `🧀 Installing missing dependency - ${packageNames.join(", ")}...`,
      ).start(),
    );

    // installing the dependency
    const pm = yield* getPackageManager(process.cwd());

    // running the installation process
    const installCmd = pm === "npm" ? "install" : "add";
    const cmd = Command.make(pm, installCmd, ...packageNames);
    yield* Command.string(cmd);

    // stop the spinner
    spinner.stop();

    // logging the success message
    yield* Effect.log(
      `👍 Installed missing dependency - ${packageNames.join(", ")}`,
    );
  });
