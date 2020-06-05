import { IntegrationInstanceConfigFieldMap } from '@jupiterone/integration-sdk-core';

const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  getLatestScanFindings: {
    type: 'boolean',
  },
  apiKey: {
    type: 'string',
    mask: true,
  },
};

export default instanceConfigFields;
