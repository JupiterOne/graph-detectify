import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  Relationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createServicesClient } from '../../collector';
import {
  convertFinding,
  convertReport,
  getAccountEntity,
  getServiceEntity,
} from '../../converter';
import { Entities, Steps, Relationships } from '../../constants';

const step: IntegrationStep = {
  id: Steps.REPORTS,
  name: 'Fetch Detectify findings from the latest scan reports',
  entities: [Entities.REPORT, Entities.FINDING],
  relationships: [
    Relationships.ACCOUNT_HAS_REPORT,
    Relationships.SERVICE_PERFORMED_REPORT,
    Relationships.REPORT_IDENTIFIED_FINDING,
    Relationships.ENDPOINT_HAS_FINDING,
  ],
  // types: [Entities.FINDING._type, Entities.REPORT._type],
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

          const accountReportRelationship = createDirectRelationship({
            from: accountEntity,
            to: reportEntity,
            _class: RelationshipClass.HAS,
          });
          await jobState.addRelationship(accountReportRelationship);

          const serviceReportRelationship = createDirectRelationship({
            from: serviceEntity,
            to: reportEntity,
            _class: RelationshipClass.PERFORMED,
          });
          await jobState.addRelationship(serviceReportRelationship);

          const findingEntities = report.findings
            ? report.findings.map(convertFinding)
            : [];
          await jobState.addEntities(findingEntities);

          const findingRelationships: Relationship[] = [];
          findingEntities.forEach((findingEntity) => {
            findingRelationships.push(
              createDirectRelationship({
                from: reportEntity,
                to: findingEntity,
                _class: RelationshipClass.IDENTIFIED,
              }),
            );

            if (findingEntity.endpoint) {
              findingRelationships.push(
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
          await jobState.addRelationships(findingRelationships);
        }
      },
    );
  },
};

export default step;
