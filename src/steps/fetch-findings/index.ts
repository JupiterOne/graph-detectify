import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';

import { createServicesClient } from '../../collector';
import { convertFinding } from '../../converter';

const MS_IN_A_DAY = 86400000;
const DAYS_TO_GET = 30;

const step: IntegrationStep = {
  id: 'fetch-findings',
  name: `Fetch Detectify findings from past ${DAYS_TO_GET} days`,
  types: ['detectify_finding'],
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

        const relationships = [];
        findingEntities.forEach((findingEntity) => {
          if (findingEntity.endpoint) {
            relationships.push(
              createIntegrationRelationship({
                fromType: 'detectify_endpoint',
                fromKey: `detectify-endpoint:${findingEntity.endpoint}`,
                toType: findingEntity._type,
                toKey: findingEntity._key,
                _class: 'HAS',
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
