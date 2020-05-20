import { IntegrationInstanceConfigFieldMap } from '@jupiterone/integration-sdk';

const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  getLastReport: {
    type: 'boolean',
  },
  apiKey: {
    type: 'string',
    mask: true,
  },
};

export default instanceConfigFields;
