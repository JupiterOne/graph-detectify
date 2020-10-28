import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk-core';

import { createServicesClient } from '../../collector';
import { convertProfile } from '../../converter';
import { Entities, Steps } from '../../constants';

const step: IntegrationStep = {
  id: Steps.SCAN_PROFILES,
  name: 'Fetch Detectify scan reports',
  types: [Entities.SCAN_PROFILE._type],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(instance.config as any).getLatestScanFindings) {
      return;
    }

    const client = createServicesClient(instance);
    const domains = await client.getRootDomains();

    for (const domain of domains) {
      if (domain.token) {
        const profiles = await client.getScanProfiles(domain.token);
        const profileEntities = profiles.map(convertProfile);
        await jobState.addEntities(profileEntities);

        for (const profileEntity of profileEntities) {
          if (profileEntity.token) {
            const scanProfileRelationship = createIntegrationRelationship({
              fromType: Entities.WEB_APP_DOMAIN._type,
              fromKey: `web-app-domain:${domain.name}`,
              toType: profileEntity._type,
              toKey: profileEntity._key,
              _class: 'HAS',
            });
            await jobState.addRelationship(scanProfileRelationship);
          }
        }
      }
    }
  },
};

export default step;
