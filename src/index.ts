type Domain = { url: string };

type Context<T = Domain> = {
  params: unknown;
  results: T[];
};

type Middleware = (
  context: Context,
  dispatch: () => Promise<unknown>
) => Promise<unknown>;

type Composed = (context: Context, next: Middleware) => Promise<unknown>;

export const compose = (middleware: Middleware[]): Composed => (
  context: Context,
  next: Middleware
): Promise<unknown> => {
  // last called middleware #
  let currentIndex = -1;

  function dispatch(dispatchedIndex: number): Promise<unknown> {
    if (dispatchedIndex <= currentIndex) {
      return Promise.reject(new Error("next() can only be called once."));
    }

    currentIndex = dispatchedIndex;
    let fn = middleware[dispatchedIndex];

    if (dispatchedIndex === middleware.length) {
      fn = next;
    }

    if (!fn) {
      return Promise.resolve();
    }

    try {
      return Promise.resolve(
        fn(context, dispatch.bind(null, dispatchedIndex + 1))
      );
    } catch (err) {
      return Promise.reject(err);
    }
  }

  return dispatch(0);
};
