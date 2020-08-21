interface Options {
  asyncFn: () => Promise<any>;
  interval?: number;
  shouldStop: (response: any) => boolean;
  shouldKeepOnError?: (error: any) => boolean;
  signal?: any;
}

export function createAsyncPolling({
  asyncFn,
  interval = 2000,
  shouldStop,
  shouldKeepOnError = () => true,
  signal,
}: Options) {
  return new Promise((resolve, reject) => {
    let timeoutId: number;
    let aborted = false;

    function poll() {
      asyncFn().then(
        response => {
          clearTimeout(timeoutId);
          if (aborted) {
            return;
          }
          if (shouldStop(response)) {
            resolve(response);
          } else {
            timeoutId = setTimeout(poll, interval);
          }
        },
        (error: any) => {
          clearTimeout(timeoutId);
          if (aborted) {
            return;
          }
          if (shouldKeepOnError(error)) {
            timeoutId = setTimeout(poll, interval);
          } else {
            reject(error);
          }
        },
      );
    }

    if (signal) {
      signal.addEventListener('abort', () => {
        aborted = true;
        clearTimeout(timeoutId);
      });
    }

    poll();
  });
}
