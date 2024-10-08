export class TSConfgNotFoundError extends Error {
  readonly _tag = "TSConfgNotFoundError";
}

export class NextError extends Error {
  readonly _tag = "NextError";
}

export class MissingDependencies extends Error {
  readonly _tag = "MissingDependencies";
}
