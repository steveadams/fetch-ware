import { Response } from 'node-fetch';
import { json } from './json';

const next = jest
  .fn()
  .mockResolvedValue(new Response('{"bar":"baz"}', { status: 200 }));

// afterEach(() =>
//   next.should.have.been.calledWith('url', {
//     body: '{"foo":"bar"}',
//     json: { foo: 'bar' },
//     headers: {
//       Accept: 'application/json',
//       'Content-Type': 'application/json'
//     }
//   })
// );

test('should resolve', async () => {
  const { parsed } = await json('url', { json: { foo: 'bar' } }, next);

  expect(parsed).toMatchObject({ bar: 'baz' });
});
