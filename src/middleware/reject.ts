import { Middleware } from '../lib/compose';

export class UnexpectedResponseError extends Error {
  constructor(public readonly response: Response) {
    super(response.statusText);
  }
}

export type Test = (response: Response) => boolean;

const defaultTest: Test = ({ status }) => status >= 400;

export const reject =
  (test: Test = defaultTest): Middleware =>
  async (url, init, next = fetch) => {
    const response = await next(url, init);

    if ((test || defaultTest)(response)) {
      throw new UnexpectedResponseError(response);
    }

    return response;
  };
