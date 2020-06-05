import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';

import validateInvocation from '../validateInvocation';

import fetchMock from 'jest-fetch-mock';
import { ServicesClientInput } from '../collector/ServicesClient';

beforeEach(() => {
  fetchMock.doMock();
});

test('rejects if apiKey is not present', async () => {
  fetchMock.mockResponse('{}');

  const context = createMockExecutionContext<ServicesClientInput>();
  context.instance.config = {} as ServicesClientInput;

  await expect(validateInvocation(context)).rejects.toThrow(
    /Provider authentication failed/,
  );
});

test('rejects if unable to hit provider apis', async () => {
  fetchMock.mockResponse(() =>
    Promise.resolve({
      status: 403,
      body: 'Unauthorized',
    }),
  );

  const context = createMockExecutionContext<ServicesClientInput>();
  context.instance.config = {
    apiKey: 'test',
  };

  await expect(validateInvocation(context)).rejects.toThrow(
    /Provider authentication failed/,
  );
});

test('performs sample api call to ensure api can be hit', async () => {
  fetchMock.mockResponse(JSON.stringify({ result: [] }));

  const context = createMockExecutionContext<ServicesClientInput>();
  context.instance.config = {
    getLatestScanFindings: false,
    apiKey: 'test',
  };

  await expect(validateInvocation(context)).resolves.toBe(undefined);
});
