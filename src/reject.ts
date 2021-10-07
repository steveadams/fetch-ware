import { Middleware } from './compose';

export class UnexpectedResponseError extends Error {
  constructor(public readonly response: Response) {
    super(response.statusText);
  }
}

type Test = (response: Response) => boolean;

export type RejectOptions = { test?: Test };

const defaultTest: Test = ({ status }) => status >= 400;

export function reject({ test }: RejectOptions = {}): Middleware {
  return async (url, init, next) => {
    const response = await next(url, init);
    if ((test || defaultTest)(response)) {
      throw new UnexpectedResponseError(response);
    }

    return response;
  };
}
