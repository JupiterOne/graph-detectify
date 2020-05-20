import {
  IntegrationExecutionContext,
  IntegrationProviderAuthenticationError,
} from '@jupiterone/integration-sdk';

import { createServicesClient } from './collector';

export default async function validateInvocation(
  context: IntegrationExecutionContext,
): Promise<void> {
  try {
    const client = createServicesClient(context.instance);
    await client.test();
  } catch (err) {
    throw new IntegrationProviderAuthenticationError({
      cause: err,
      endpoint: 'api.detectify.com/rest/v2/',
      status: 401,
      statusText: err.toString(),
    });
  }
}
