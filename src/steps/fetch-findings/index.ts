import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  Relationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createServicesClient } from '../../collector';
import { convertFinding } from '../../converter';
import { Entities, Steps, Relationships } from '../../constants';

const MS_IN_A_DAY = 86400000;
const DAYS_TO_GET = 30;

const step: IntegrationStep = {
  id: Steps.FINDINGS,
  name: `Fetch Detectify findings from past ${DAYS_TO_GET} days`,
  entities: [Entities.FINDING],
  relationships: [Relationships.ENDPOINT_HAS_FINDING],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((instance.config as any).getLatestScanFindings) {
      return;
    }

    const client = createServicesClient(instance);
    const domains = await client.getRootDomains();

    const now = new Date().getTime();
    const from =
      (new Date(now - MS_IN_A_DAY * DAYS_TO_GET).getTime() / 1000) | 0;

    for (const domain of domains) {
      if (domain.token) {
        const findings = await client.getDomainFindings(domain.token, {
          from: from.toString(),
        });
        const findingEntities = findings.map(convertFinding);
        await jobState.addEntities(findingEntities);

        const relationships: Relationship[] = [];
        findingEntities.forEach((findingEntity) => {
          if (findingEntity.endpoint) {
            relationships.push(
              createDirectRelationship({
                fromType: Entities.WEB_APP_ENDPOINT._type,
                fromKey: `web-app-endpoint:${findingEntity.endpoint}`,
                toType: findingEntity._type,
                toKey: findingEntity._key,
                _class: RelationshipClass.HAS,
              }),
            );
          }
        });
        await jobState.addRelationships(relationships);
      }
    }
  },
};

export default step;
