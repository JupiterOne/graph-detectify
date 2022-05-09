import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
  JobState,
} from '@jupiterone/integration-sdk-core';

import { createServicesClient } from '../../collector';
import { convertFinding, getSubdomainEntityKey } from '../../converter';
import { Entities, Steps, Relationships } from '../../constants';

const MS_IN_A_DAY = 86400000;
const DAYS_TO_GET = 30;

function getFindingsFromTimestamp() {
  const now = new Date().getTime();
  return (new Date(now - MS_IN_A_DAY * DAYS_TO_GET).getTime() / 1000) | 0;
}

async function domainFindingIteratee(jobState: JobState, domainFinding: any) {
  const findingEntity = await jobState.addEntity(convertFinding(domainFinding));

  const findingEntityEndpoint = findingEntity.endpoint as string;
  if (!findingEntityEndpoint) return;

  const subdomainEntity = await jobState.findEntity(
    getSubdomainEntityKey(findingEntityEndpoint),
  );

  if (!subdomainEntity) return;

  await jobState.addRelationship(
    createDirectRelationship({
      from: subdomainEntity,
      to: findingEntity,
      _class: RelationshipClass.HAS,
    }),
  );
}

const step: IntegrationStep = {
  id: Steps.FINDINGS,
  name: `Fetch Detectify findings from past ${DAYS_TO_GET} days`,
  entities: [Entities.FINDING],
  relationships: [Relationships.ENDPOINT_HAS_FINDING],
  dependsOn: [Steps.ASSETS],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    if (!instance.config.getLatestScanFindings) return;

    const client = createServicesClient(instance);
    const fromDateString = getFindingsFromTimestamp().toString();

    await jobState.iterateEntities(
      {
        _type: Entities.WEB_APP_DOMAIN._type,
      },
      async (domainEntity) => {
        const domainEntityToken = domainEntity.token as string;
        if (!domainEntityToken) return;

        await client.iterateDomainFindings({
          token: domainEntityToken,
          queryParams: {
            from: fromDateString,
          },
          async iteratee(domainFinding) {
            await domainFindingIteratee(jobState, domainFinding);
          },
        });
      },
    );
  },
};

export default step;
