import {
  IntegrationExecutionContext,
  IntegrationProviderAuthenticationError,
} from '@jupiterone/integration-sdk-core';

import { createServicesClient } from './collector';
import { ServicesClientInput } from './collector/ServicesClient';

export default async function validateInvocation(
  context: IntegrationExecutionContext<ServicesClientInput>,
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
