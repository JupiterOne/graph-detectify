import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';

import { createServicesClient } from '../../collector';
import { convertDomain, convertSubdomain } from '../../converter';

const step: IntegrationStep = {
  id: 'fetch-assets',
  name: 'Fetch Detectify domains and subdomains (application endpoints)',
  types: ['web_app', 'web_app_endpoint'],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    const client = createServicesClient(instance);

    const domains = await client.getRootDomains();
    const domainEntities = domains.map(convertDomain);
    await jobState.addEntities(domainEntities);

    for (const domainEntity of domainEntities) {
      if (domainEntity.token) {
        const subdomains = await client.getSubDomains(domainEntity.token);
        const subdomainEntities = subdomains.map(convertSubdomain);
        await jobState.addEntities(subdomainEntities);

        const relationships = subdomainEntities.map((subdomainEntity) =>
          createIntegrationRelationship({
            from: domainEntity,
            to: subdomainEntity,
            _class: 'HAS',
          }),
        );
        await jobState.addRelationships(relationships);
      }
    }
  },
};

export default step;
