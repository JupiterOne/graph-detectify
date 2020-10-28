import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createServicesClient } from '../../collector';
import { convertProfile } from '../../converter';
import { Entities, Steps, Relationships } from '../../constants';

const step: IntegrationStep = {
  id: Steps.SCAN_PROFILES,
  name: 'Fetch Detectify scan reports',
  entities: [Entities.SCAN_PROFILE],
  relationships: [Relationships.DOMAIN_HAS_SCAN_PROFILE],
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
            const scanProfileRelationship = createDirectRelationship({
              fromType: Entities.WEB_APP_DOMAIN._type,
              fromKey: `web-app-domain:${domain.name}`,
              toType: profileEntity._type,
              toKey: profileEntity._key,
              _class: RelationshipClass.HAS,
            });
            await jobState.addRelationship(scanProfileRelationship);
          }
        }
      }
    }
  },
};

export default step;
