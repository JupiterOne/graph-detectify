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
  dependsOn: [Steps.ASSETS],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    if (!instance.config.getLatestScanFindings) return;
    const client = createServicesClient(instance);

    await jobState.iterateEntities(
      {
        _type: Entities.WEB_APP_DOMAIN._type,
      },
      async (domainEntity) => {
        const domainEntityToken = domainEntity.token as string;
        if (!domainEntityToken) return;

        const profiles = await client.getScanProfiles(domainEntityToken);
        const profileEntities = profiles.map(convertProfile);
        await jobState.addEntities(profileEntities);

        for (const profileEntity of profileEntities) {
          if (!profileEntity.token) continue;

          await jobState.addRelationship(
            createDirectRelationship({
              fromType: Entities.WEB_APP_DOMAIN._type,
              fromKey: `web-app-domain:${domainEntity.name}`,
              toType: profileEntity._type,
              toKey: profileEntity._key,
              _class: RelationshipClass.HAS,
            }),
          );
        }
      },
    );
  },
};

export default step;
