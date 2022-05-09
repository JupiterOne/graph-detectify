import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';
import {
  IntegrationConfig,
  instanceConfigFields,
  validateInvocation,
} from './config';
import fetchAccount from './steps/fetch-account';
import fetchAssets from './steps/fetch-assets';
import fetchFindings from './steps/fetch-findings';
import fetchReports from './steps/fetch-reports';
import fetchScanProfiles from './steps/fetch-scan-profiles';

export const invocationConfig: IntegrationInvocationConfig<IntegrationConfig> =
  {
    instanceConfigFields,
    validateInvocation,
    integrationSteps: [
      fetchAccount,
      fetchAssets,
      fetchFindings,
      fetchReports,
      fetchScanProfiles,
    ],
  };
