import { Response } from 'node-fetch';

import { query } from './query';

const URL = 'https://middleware.co/queries';
const EXPECTED_URL = 'https://middleware.co/queries?one=1&two=2';

const next = jest.fn();

next.mockResolvedValue(new Response('ok', { status: 200 }));

test('With URLSearchParams args: Query appears in url', async () => {
  expect(query(URL, { query: new URLSearchParams({ one: '1' }) }, next))
    .resolves;
  expect(next).lastCalledWith(`${URL}?one=1`, {});
});

test('With {key: val} args: Query appears in url', async () => {
  expect(query(URL, { query: { one: '1', two: '2' } }, next)).resolves;
  expect(next).lastCalledWith(EXPECTED_URL, {});
});

test('With string[][] args: Query appears in url', async () => {
  expect(
    query(
      URL,
      {
        query: [
          ['one', '1'],
          ['two', '2']
        ]
      },
      next
    )
  ).resolves;
  expect(next).lastCalledWith(EXPECTED_URL, {});
});

test('With string args: Query appears in url', async () => {
  expect(query(URL, { query: 'one=1&two=2' }, next)).resolves;
  expect(next).lastCalledWith(EXPECTED_URL, {});
});

test('Query combines with existing url params', async () => {
  expect(
    query(`${URL}?one=1`, { query: new URLSearchParams({ two: '2' }) }, next)
  ).resolves;
  expect(next).lastCalledWith(EXPECTED_URL, {});
});

test('Query combines with existing url params and overrides existing params', async () => {
  expect(
    query(
      `${URL}?one=1&two=abcd`,
      { query: new URLSearchParams({ two: '2' }) },
      next
    )
  ).resolves;
  expect(next).lastCalledWith(EXPECTED_URL, {});
});

test('Encoding keyed params works', async () => {
  expect(
    query(
      `${URL}?test=keying`,
      {
        query: new URLSearchParams({
          'keyed[0]': 'params',
          'keyed[1]': 'work'
        })
      },
      next
    )
  ).resolves;
  expect(next).lastCalledWith(
    encodeURI(`${URL}?test=keying&keyed[0]=params&keyed[1]=work`),
    {}
  );
});

test('Query has no effect on url when excluded', async () => {
  expect(query(URL, { query: undefined }, next)).resolves;
  expect(next).lastCalledWith(URL, {});
});
