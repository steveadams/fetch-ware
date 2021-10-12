import { Middleware } from '../lib/compose';

type RequestInitWithQueryParams = RequestInit & {
  query?: ConstructorParameters<typeof URLSearchParams>[0] | URLSearchParams;
};

export const query: Middleware<RequestInfo, RequestInitWithQueryParams> = (
  url,
  init,
  next = fetch
) => {
  if (!init.query) {
    return next(url, init);
  }

  const inUrl = new URL(url.toString());
  const outUrl = new URL(inUrl);
  const params =
    init.query instanceof URLSearchParams
      ? init.query
      : new URLSearchParams(init.query);

  params.forEach((value, key) => {
    outUrl.searchParams.set(key, value);
  });

  delete init.query;

  return next(outUrl.toString(), init);
};
