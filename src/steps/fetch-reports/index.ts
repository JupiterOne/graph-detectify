import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';

import { createServicesClient } from '../../collector';
import {
  convertFinding,
  convertReport,
  getAccountEntity,
  getServiceEntity,
} from '../../converter';
import { Entities, Steps } from '../../constants';

const step: IntegrationStep = {
  id: Steps.REPORTS,
  name: 'Fetch Detectify findings from the latest scan reports',
  types: [Entities.FINDING._type, Entities.REPORT._type],
  dependsOn: [Steps.SCAN_PROFILES],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(instance.config as any).getLatestScanFindings) {
      return;
    }

    const accountEntity = getAccountEntity(instance);
    const serviceEntity = getServiceEntity(instance);

    const client = createServicesClient(instance);

    await jobState.iterateEntities(
      { _type: Entities.SCAN_PROFILE._type },
      async (profileEntity) => {
        if (profileEntity.token) {
          const report = await client.getLatestFullReport(
            profileEntity.token as string,
          );
          const reportEntity = convertReport(report);
          await jobState.addEntity(reportEntity);

          const accountReportRelationship = createIntegrationRelationship({
            from: accountEntity,
            to: reportEntity,
            _class: 'HAS',
          });
          await jobState.addRelationship(accountReportRelationship);

          const serviceReportRelationship = createIntegrationRelationship({
            from: serviceEntity,
            to: reportEntity,
            _class: 'PERFORMED',
          });
          await jobState.addRelationship(serviceReportRelationship);

          const findingEntities = report.findings
            ? report.findings.map(convertFinding)
            : [];
          await jobState.addEntities(findingEntities);

          const findingRelationships: Relationship[] = [];
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
                  fromType: Entities.WEB_APP_ENDPOINT._type,
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
      },
    );
  },
};

export default step;
