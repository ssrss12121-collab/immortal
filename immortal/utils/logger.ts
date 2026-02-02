const logger = {
  log: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.error(...args);
    } else {
      // In production, you could send to error tracking service
      // Example: Sentry.captureException(args[0]);
    }
  },
  
  warn: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.info(...args);
    }
  }
};

export default logger;
