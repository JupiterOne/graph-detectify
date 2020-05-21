import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';

import { createServicesClient } from '../../collector';
import { convertFinding, convertProfile, convertReport } from '../../converter';

const step: IntegrationStep = {
  id: 'fetch-reports',
  name: 'Fetch Detectify findings from the latest scan reports',
  types: ['detectify_finding'],
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
            const report = await client.getLatestFullReport(
              profileEntity.token,
            );
            const reportEntity = convertReport(report);
            await jobState.addEntity(reportEntity);

            const findingEntities = report.findings
              ? report.findings.map(convertFinding)
              : [];
            await jobState.addEntities(findingEntities);

            const scanProfileRelationship = createIntegrationRelationship({
              fromType: 'web_app_domain',
              fromKey: `web-app-domain:${domain.name}`,
              toType: profileEntity._type,
              toKey: profileEntity._key,
              _class: 'HAS',
            });
            await jobState.addRelationship(scanProfileRelationship);

            const findingRelationships = [];
            findingEntities.forEach((findingEntity) => {
              findingRelationships.push(
                createIntegrationRelationship({
                  from: reportEntity,
                  to: findingEntity,
                  _class: 'IDENTIFIED',
                }),
              );

              if (findingEntity.endpoint) {
                findingRelationships.push(
                  createIntegrationRelationship({
                    fromType: 'web_app_endpoint',
                    fromKey: `web-app-endpoint:${findingEntity.endpoint}`,
                    toType: findingEntity._type,
                    toKey: findingEntity._key,
                    _class: 'HAS',
                  }),
                );
              }
            });
            await jobState.addRelationships(findingRelationships);
          }
        }
      }
    }
  },
};

export default step;
