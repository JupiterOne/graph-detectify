import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';

import instanceConfigFields from './instanceConfigFields';
import validateInvocation from './validateInvocation';

import fetchAccount from './steps/fetch-account';
import fetchAssets from './steps/fetch-assets';
import fetchFindings from './steps/fetch-findings';
import fetchReports from './steps/fetch-reports';
import { ServicesClientInput } from './collector/ServicesClient';

export const invocationConfig: IntegrationInvocationConfig<ServicesClientInput> = {
  instanceConfigFields,
  validateInvocation,
  integrationSteps: [fetchAccount, fetchAssets, fetchFindings, fetchReports],
};
