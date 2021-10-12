import { Response as NodeFetchResponse } from 'node-fetch';
import { reject, UnexpectedResponseError } from './reject';

// Type coercion to satisfy TS
const next =
  (...params: ConstructorParameters<typeof NodeFetchResponse>) =>
  async (_url: RequestInfo, _init: RequestInit) =>
    new NodeFetchResponse(...params) as unknown as Response;

const defaultMiddleware = reject();

test('Default: should resolve', async () =>
  expect(
    defaultMiddleware(
      'https://custom.url/resolves',
      {},
      next('ok', { status: 200 })
    )
  ).resolves);

test('Default: should reject with invalid URL', async () =>
  expect(
    defaultMiddleware(
      'https://custom.url/rejects',
      {},
      next('ko', { status: 500 })
    )
  ).rejects.toThrow());

// Using a custom test should change to the expected behaviour
const customMiddleware = reject(({ status }) => status !== 200);

test('Custom: should resolve as expected', async () =>
  expect(
    customMiddleware(
      'https://custom.url/resolves',
      {},
      next('ok', { status: 200 })
    )
  ).resolves);

test('https://custom.url/rejects', async () =>
  expect(
    customMiddleware(
      'https://custom.url/rejects',
      {},
      next('ko', { status: 201 })
    )
  ).rejects.toThrow());

test('reject throws the correct error', async () => {
  expect.assertions(1);

  try {
    await customMiddleware(
      'https://custom.url/rejects',
      {},
      next('ko', { status: 500 })
    );
  } catch (e) {
    expect(e).toBeInstanceOf(UnexpectedResponseError);
  }
});
