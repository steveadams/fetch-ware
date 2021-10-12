type FetchParams<R, I> = [info: R, init: I];
type FetchLike<R, I> = (...args: FetchParams<R, I>) => Promise<Response>;

type MiddlewareParams<R, I> = [
  ...fetch: FetchParams<R, I>,
  next: FetchLike<R, I>
];

export type Middleware<
  R extends RequestInfo = RequestInfo,
  I extends RequestInit = RequestInit
> = {
  (...args: MiddlewareParams<R, I>): Promise<Response>;
};

type NextMiddlewareParams<R, I> = [
  ...fetch: FetchParams<R, I>,
  next?: FetchLike<R, I>
];

type NextMiddleware<
  R extends RequestInfo = RequestInfo,
  I extends RequestInit = RequestInit
> = {
  (...args: NextMiddlewareParams<R, I>): Promise<Response>;
};

type ResponseHandler = (response: Response) => void;

export function compose<
  ReqInfo extends RequestInfo = RequestInfo,
  ReqInit extends RequestInit = RequestInit
>(
  middleware: Middleware<ReqInfo, ReqInit>[],
  fetcher: FetchLike<ReqInfo, ReqInit> = fetch,
  responseHandler: ResponseHandler
): NextMiddleware<ReqInfo, ReqInit> {
  return (info, init, next?: typeof fetcher) => {
    async function chain(
      chainedInfo: ReqInfo,
      chainedInit: ReqInit,
      chainedMiddleware: Middleware<ReqInfo, ReqInit>[]
    ): Promise<Response> {
      if (!chainedMiddleware || chainedMiddleware.length === 0) {
        return await (next ?? fetcher)(chainedInfo, chainedInit);
      }

      return chainedMiddleware[0](
        chainedInfo,
        chainedInit,
        async (url, init) => {
          const response = await chain(url, init, chainedMiddleware.slice(1));
          responseHandler(response);

          return response;
        }
      );
    }

    return chain(info, init, middleware);
  };
}
