export const globalErrorHandler = (error: Error, stackTrace: string) => {
  // Log the error to the console in development
  if (__DEV__) {
    console.error('Global Error Caught:', error, stackTrace);
  }

  // You could add logic here to potentially restart the app or navigate
  // to a specific error screen if needed for critical errors.
}; 