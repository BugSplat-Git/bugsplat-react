const DEFAULT_LOGGER: Logger = console;

export enum BugSplatLogLevel {
  None,
  Error,
  Warn,
  Debug,
  Info,
  Log,
}

export interface Logger {
  error(...params: unknown[]): void;
  warn(...params: unknown[]): void;
  debug(...params: unknown[]): void;
  info(...params: unknown[]): void;
  log(...params: unknown[]): void;
}

export class BugSplatLogger implements Logger {
  static readonly LEVEL_CANNOT_BE_NULL =
    "BugSplatLogger Error: level cannot be null!";
  static readonly LOGGER_CANNOT_BE_NULL =
    "BugSplatLogger Error: logger cannot be null!";

  constructor(
    private level: BugSplatLogLevel = BugSplatLogLevel.Error,
    private logger: Logger = DEFAULT_LOGGER
  ) {
    if (level === null) {
      if (process.env.NODE_ENV !== "production") {
        throw new Error(BugSplatLogger.LEVEL_CANNOT_BE_NULL);
      }
    }

    if (logger === null) {
      if (process.env.NODE_ENV !== "production") {
        throw new Error(BugSplatLogger.LOGGER_CANNOT_BE_NULL);
      }
    }
  }

  error(...params: unknown[]): void {
    if (this.level >= BugSplatLogLevel.Error) {
      this.logger.error(...params);
    }
  }

  warn(...params: unknown[]): void {
    if (this.level >= BugSplatLogLevel.Warn) {
      this.logger.warn(...params);
    }
  }

  debug(...params: unknown[]): void {
    if (this.level >= BugSplatLogLevel.Debug) {
      this.logger.debug(...params);
    }
  }

  info(...params: unknown[]): void {
    if (this.level >= BugSplatLogLevel.Info) {
      this.logger.info(...params);
    }
  }

  log(...params: unknown[]): void {
    if (this.level >= BugSplatLogLevel.Log) {
      this.logger.log(...params);
    }
  }
}
