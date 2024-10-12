export class TSConfgNotFoundError extends Error {
  readonly _tag = "TSConfgNotFoundError";
}

export class NextError extends Error {
  readonly _tag = "NextError";
}

export class MissingDependencies extends Error {
  readonly _tag = "MissingDependencies";
}

export class ProjectAlreadyInitialized extends Error {
  readonly _tag = "ProjectAlreadyInitialized";
}

export class FormattingError extends Error {
  readonly _tag = "FormattingError";
}

export class UnInitializedProject extends Error {
  readonly _tag = "UnInitializedProject";
}

export class InvalidTempehConfig extends Error {
  readonly _tag = "InvalidTempehConfig";
}

export class InvalidRoutesDir extends Error {
  readonly _tag = "InvalidRoutesDir";
}
