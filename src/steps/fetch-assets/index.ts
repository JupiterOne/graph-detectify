import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk-core';

import { createServicesClient } from '../../collector';
import {
  convertDomain,
  convertSubdomain,
  getServiceEntity,
  getAccountEntity,
} from '../../converter';
import { Entities, Steps } from '../../constants';

const step: IntegrationStep = {
  id: Steps.ASSETS,
  name: 'Fetch Detectify domains and subdomains (application endpoints)',
  types: [Entities.WEB_APP_DOMAIN._type, Entities.WEB_APP_ENDPOINT._type],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    const client = createServicesClient(instance);

    const domains = await client.getRootDomains();
    const domainEntities = domains.map(convertDomain);
    await jobState.addEntities(domainEntities);

    const serviceEntity = getServiceEntity(instance);
    const serviceRelationships = domainEntities.map((domainEntity) =>
      createIntegrationRelationship({
        from: serviceEntity,
        to: domainEntity,
        _class: 'SCANS',
      }),
    );
    await jobState.addRelationships(serviceRelationships);

    const accountEntity = getAccountEntity(instance);
    const accountRelationships = domainEntities.map((domainEntity) =>
      createIntegrationRelationship({
        from: accountEntity,
        to: domainEntity,
        _class: 'HAS',
      }),
    );
    await jobState.addRelationships(accountRelationships);

    for (const domainEntity of domainEntities) {
      if (domainEntity.token) {
        const subdomains = await client.getSubDomains(domainEntity.token);
        const subdomainEntities = subdomains.map(convertSubdomain);
        await jobState.addEntities(subdomainEntities);

        const endpointRelationships = subdomainEntities.map((subdomainEntity) =>
          createIntegrationRelationship({
            from: domainEntity,
            to: subdomainEntity,
            _class: 'HAS',
          }),
        );
        await jobState.addRelationships(endpointRelationships);
      }
    }
  },
};

export default step;
