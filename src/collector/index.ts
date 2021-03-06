import { IntegrationInstance } from '@jupiterone/integration-sdk-core';
import { ServicesClient, ServicesClientInput } from './ServicesClient';

/**
 * Creates a ServicesClient from an integration instance using it's
 * api key.
 */
export function createServicesClient(
  instance: IntegrationInstance,
): ServicesClient {
  const { apiKey } = instance.config as ServicesClientInput;

  if (!apiKey) {
    throw new Error(
      'Required configuration item "apiKey" is missing on the integration instance config',
    );
  }

  return new ServicesClient({ apiKey });
}
