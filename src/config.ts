import {
  IntegrationExecutionContext,
  IntegrationInstanceConfig,
  IntegrationInstanceConfigFieldMap,
  IntegrationProviderAuthenticationError,
} from '@jupiterone/integration-sdk-core';
import { createServicesClient } from './collector';

/**
 * A type describing the configuration fields required to execute the
 * integration for a specific account in the data provider.
 *
 * When executing the integration in a development environment, these values may
 * be provided in a `.env` file with environment variables. For example:
 *
 * - `CLIENT_ID=123` becomes `instance.config.clientId = '123'`
 * - `CLIENT_SECRET=abc` becomes `instance.config.clientSecret = 'abc'`
 *
 * Environment variables are NOT used when the integration is executing in a
 * managed environment. For example, in JupiterOne, users configure
 * `instance.config` in a UI.
 */
export const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  getLatestScanFindings: {
    type: 'boolean',
  },
  apiKey: {
    type: 'string',
    mask: true,
  },
};

/**
 * Properties provided by the `IntegrationInstance.config`. This reflects the
 * same properties defined by `instanceConfigFields`.
 */
export interface IntegrationConfig extends IntegrationInstanceConfig {
  getLatestScanFindings: boolean;
  apiKey: string;
}

export async function validateInvocation(
  context: IntegrationExecutionContext<IntegrationConfig>,
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
