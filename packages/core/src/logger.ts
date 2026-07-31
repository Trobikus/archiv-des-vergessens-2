export type LogLevel = "debug" | "info" | "warn" | "error";

export type Logger = {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
};

export type LoggerSink = (level: LogLevel, message: string, data?: unknown) => void;

export function createLogger(
  scope: string,
  sink: LoggerSink = defaultSink,
): Logger {
  const write = (level: LogLevel, message: string, data?: unknown): void => {
    sink(level, `[${scope}] ${message}`, data);
  };

  return {
    debug: (message, data) => {
      write("debug", message, data);
    },
    info: (message, data) => {
      write("info", message, data);
    },
    warn: (message, data) => {
      write("warn", message, data);
    },
    error: (message, data) => {
      write("error", message, data);
    },
  };
}

function defaultSink(level: LogLevel, message: string, data?: unknown): void {
  if (level === "warn") {
    console.warn(message, data);
    return;
  }
  if (level === "error") {
    console.error(message, data);
  }
}
