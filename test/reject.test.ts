import { reject, UnexpectedResponseError } from '../src/reject';

let next = jest.fn();

beforeEach(() => (next = jest.fn()));

afterEach(() => expect(next).toBeCalledTimes(1));

const defaultMiddleware = reject();

next.mockReturnValueOnce(new Response('ok', { status: 200 }));

test('Default: should resolve', async () =>
  expect(defaultMiddleware('url', {}, next)).resolves);

next.mockReturnValueOnce(new Response('oops', { status: 500 }));

test('Default: should reject with invalid URL', async () =>
  expect(defaultMiddleware('url', {}, next)).rejects.toThrow());

// Using a custom test should change to the expected behaviour
const customMiddleware = reject({ test: ({ status }) => status !== 200 });

next.mockRejectedValueOnce(new Response('ok', { status: 200 }));

test('Custom: should resolve as expected', async () =>
  expect(customMiddleware('url', {}, next)).resolves);

next.mockReturnValueOnce(new Response('oops', { status: 202 }));

test('Custom: should reject as expected', async () =>
  expect(customMiddleware('url', {}, next)).rejects.toThrow());

test('the fetch fails with an error', async () => {
  expect.assertions(1);

  try {
    await customMiddleware('url', {}, next);
  } catch (e) {
    console.log(e);
    expect(e).toBeInstanceOf(UnexpectedResponseError);
  }
});
