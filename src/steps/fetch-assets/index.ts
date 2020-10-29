import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createServicesClient } from '../../collector';
import {
  convertDomain,
  convertSubdomain,
  getServiceEntity,
  getAccountEntity,
} from '../../converter';
import { Entities, Steps, Relationships } from '../../constants';

const step: IntegrationStep = {
  id: Steps.ASSETS,
  name: 'Fetch Detectify domains and subdomains (application endpoints)',
  entities: [Entities.WEB_APP_DOMAIN, Entities.WEB_APP_ENDPOINT],
  relationships: [
    Relationships.SERVICE_SCANS_DOMAIN,
    Relationships.ACCOUNT_HAS_DOMAIN,
    Relationships.DOMAIN_HAS_SUBDOMAIN,
  ],
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
      createDirectRelationship({
        from: serviceEntity,
        to: domainEntity,
        _class: RelationshipClass.SCANS,
      }),
    );
    await jobState.addRelationships(serviceRelationships);

    const accountEntity = getAccountEntity(instance);
    const accountRelationships = domainEntities.map((domainEntity) =>
      createDirectRelationship({
        from: accountEntity,
        to: domainEntity,
        _class: RelationshipClass.HAS,
      }),
    );
    await jobState.addRelationships(accountRelationships);

    for (const domainEntity of domainEntities) {
      if (domainEntity.token) {
        const subdomains = await client.getSubDomains(domainEntity.token);
        const subdomainEntities = subdomains.map(convertSubdomain);
        await jobState.addEntities(subdomainEntities);

        const endpointRelationships = subdomainEntities.map((subdomainEntity) =>
          createDirectRelationship({
            from: domainEntity,
            to: subdomainEntity,
            _class: RelationshipClass.HAS,
          }),
        );
        await jobState.addRelationships(endpointRelationships);
      }
    }
  },
};

export default step;
