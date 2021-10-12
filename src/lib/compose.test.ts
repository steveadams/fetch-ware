import { Response as NodeFetchResponse } from 'node-fetch';

import { compose, Middleware } from './compose';

// Response is a readonly object. This allows us to write a test value to Response to test that a
// single instance has received and carried a value through the composed promise chain
declare global {
  interface Response {
    testProp: number;
  }
}

// This satisfies TypeScript and shouldn't interfere with writing valid tests
const fetcher = (
  jest.fn() as jest.MockedFunction<typeof fetch>
).mockResolvedValue(new NodeFetchResponse('ok', {}) as unknown as Response);

test('should chain middleware in sequence', async () => {
  const [m1, m2, m3]: Middleware[] = [
    async (url, init, next) => {
      expect(init).toHaveProperty('body', '0');
      init.body = '1';

      const response = await next(url, init);
      expect(response).toHaveProperty('testProp', 2);

      response.testProp = 1;

      return response;
    },
    async (url, init, next) => {
      expect(init).toHaveProperty('body', '1');
      init.body = '2';

      const response = await next(url, init);
      expect(response).toHaveProperty('testProp', 3);

      response.testProp = 2;

      return response;
    },
    async (url, init, next) => {
      expect(init).toHaveProperty('body', '2');
      init.body = '3';

      const response = await next(url, init);
      expect(response).toHaveProperty('status', 200);

      response.testProp = 3;

      return response;
    }
  ];

  const responseList: Response[] = [];

  const onResponse = (response: Response) => responseList.push(response);

  const response = await compose(
    [m1, m2, m3],
    fetcher,
    onResponse
  )('http://url.com/foo', {
    body: '0',
    method: 'POST'
  });

  expect(response).toHaveProperty('testProp', 1);
  expect(response.text()).resolves.toMatch('ok');
  expect(responseList).toHaveLength(3);
});

test('should short chain', async () => {
  const [m1, m2, m3]: Middleware[] = [
    async (url, init, next) => {
      expect(init).toHaveProperty('body', '9');
      init.body = '1';
      expect(await next(url, init)).rejects;
      throw new Error('foo');
    },
    async (_url, init, _next) => {
      expect(init).toHaveProperty('body', '1');
      throw new Error('oops');
    },
    async (_url, _init, _next) => {
      throw new Error('should not reach third middleware');
    }
  ];

  try {
    await compose(
      [m1, m2, m3],
      fetcher,
      () => void 0
    )('', {
      body: '9'
    });
  } catch (e) {
    expect(e).toBeDefined();
  }
});
