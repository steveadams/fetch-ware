export type Middleware = (
  url: RequestInfo,
  init: RequestInit,
  next: (url: RequestInfo, init: RequestInit) => Promise<Response>
) => Promise<Response>;

export function compose(middleware: Middleware[]): Middleware {
  return (url, init, next) => {
    async function chain(
      url: RequestInfo,
      init: RequestInit,
      middleware: Middleware[]
    ): Promise<Response> {
      if (!middleware || middleware.length === 0) {
        return (next ?? fetch)(url, init);
      }

      return middleware[0](url, init, (url, init) =>
        chain(url, init, middleware.slice(1))
      );
    }

    return chain(url, init, middleware);
  };
}
