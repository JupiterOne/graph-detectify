import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk';

import instanceConfigFields from './instanceConfigFields';
import validateInvocation from './validateInvocation';

import fetchAccount from './steps/fetch-account';
import fetchAssets from './steps/fetch-assets';
import fetchFindings from './steps/fetch-findings';
import fetchReports from './steps/fetch-reports';

export const invocationConfig: IntegrationInvocationConfig = {
  instanceConfigFields,
  validateInvocation,
  integrationSteps: [fetchAccount, fetchAssets, fetchFindings, fetchReports],
};
