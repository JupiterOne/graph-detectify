import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
  IntegrationError,
} from '@jupiterone/integration-sdk-core';

import { createServicesClient } from '../../collector';
import {
  convertDomain,
  convertSubdomain,
  buildServiceEntityKey,
  buildAccountEntityKey,
  createDomainKey,
} from '../../converter';
import { Entities, Steps, Relationships } from '../../constants';

async function fetchRootDomains({
  instance,
  jobState,
}: IntegrationStepExecutionContext) {
  const client = createServicesClient(instance);

  await client.iterateRootDomains(async (domainAsset) => {
    if (!jobState.hasKey(createDomainKey(domainAsset.name))) return;
    await jobState.addEntity(convertDomain(domainAsset));
  });
}

async function buildServiceDomainRelationships({
  instance,
  jobState,
}: IntegrationStepExecutionContext) {
  const serviceEntity = await jobState.findEntity(
    buildServiceEntityKey(instance.id),
  );

  if (!serviceEntity) {
    throw new IntegrationError({
      message: 'Could not find service entity in job state',
      code: 'MISSING_ENTITY',
      fatal: true,
    });
  }

  await jobState.iterateEntities(
    {
      _type: Entities.WEB_APP_DOMAIN._type,
    },
    async (domainEntity) => {
      await jobState.addRelationship(
        createDirectRelationship({
          from: serviceEntity,
          to: domainEntity,
          _class: RelationshipClass.SCANS,
        }),
      );
    },
  );
}

async function buildAccountDomainRelationships({
  instance,
  jobState,
}: IntegrationStepExecutionContext) {
  const accountEntity = await jobState.findEntity(
    buildAccountEntityKey(instance.id),
  );

  if (!accountEntity) {
    throw new IntegrationError({
      message: 'Could not find account entity in job state',
      code: 'MISSING_ENTITY',
      fatal: true,
    });
  }

  await jobState.iterateEntities(
    {
      _type: Entities.WEB_APP_DOMAIN._type,
    },
    async (domainEntity) => {
      await jobState.addRelationship(
        createDirectRelationship({
          from: accountEntity,
          to: domainEntity,
          _class: RelationshipClass.HAS,
        }),
      );
    },
  );
}

async function fetchSubdomainsForRootDomains({
  instance,
  jobState,
}: IntegrationStepExecutionContext) {
  const client = createServicesClient(instance);

  await jobState.iterateEntities(
    {
      _type: Entities.WEB_APP_DOMAIN._type,
    },
    async (domainEntity) => {
      const domainEntityToken = domainEntity.token as string;
      if (!domainEntityToken) return;

      await client.iterateSubdomains(
        domainEntityToken,
        async (subdomainAsset) => {
          const subdomainEntity = await jobState.addEntity(
            convertSubdomain(subdomainAsset),
          );

          // NOTE: This is in the same step to avoid needing to create an
          // index on the subdomains for each domain
          await jobState.addRelationship(
            createDirectRelationship({
              from: domainEntity,
              to: subdomainEntity,
              _class: RelationshipClass.HAS,
            }),
          );
        },
      );
    },
  );
}

const step: IntegrationStep = {
  id: Steps.ASSETS,
  name: 'Fetch Detectify domains and subdomains (application endpoints)',
  entities: [Entities.WEB_APP_DOMAIN, Entities.WEB_APP_ENDPOINT],
  relationships: [
    Relationships.SERVICE_SCANS_DOMAIN,
    Relationships.ACCOUNT_HAS_DOMAIN,
    Relationships.DOMAIN_HAS_SUBDOMAIN,
  ],
  dependsOn: [Steps.ACCOUNT],
  async executionHandler(context: IntegrationStepExecutionContext) {
    await fetchRootDomains(context);
    await buildServiceDomainRelationships(context);
    await buildAccountDomainRelationships(context);
    await fetchSubdomainsForRootDomains(context);
  },
};

export default step;
