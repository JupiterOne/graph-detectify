import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  Relationship,
  RelationshipClass,
  IntegrationLogger,
  IntegrationWarnEventName,
} from '@jupiterone/integration-sdk-core';

import { createServicesClient } from '../../collector';
import {
  convertFinding,
  convertReport,
  getAccountEntity,
  getServiceEntity,
} from '../../converter';
import { Entities, Steps, Relationships } from '../../constants';
import { ServicesClient } from '../../collector/ServicesClient';

async function getLatestFullReport({
  token,
  client,
  logger,
}: {
  token: string;
  logger: IntegrationLogger;
  client: ServicesClient;
}) {
  try {
    const report = await client.getLatestFullReport(token);
    return report;
  } catch (err) {
    // TODO: Improve this to handle the specific 1009 error code
    //
    // Ex: Caused by: Error: {"error":{"code":1009,"message":"API key cannot access this endpoint, or the team doesn't have permissions to change scan region","more_info":"https://developer.detectify.com/#tag/error-codes"}}
    if (err.status === 403) {
      logger.info({ token, err }, 'Unable to fetch latest scan report');

      logger.publishWarnEvent({
        name: IntegrationWarnEventName.MissingPermission,
        description: `Fetching full Detectify scan reports is an enterprise feature - API key cannot access this endpoint, or the team doesn't have permissions to change scan region`,
      });

      return;
    }

    throw err;
  }
}

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
  dependsOn: [Steps.SCAN_PROFILES],
  async executionHandler({
    instance,
    jobState,
    logger,
  }: IntegrationStepExecutionContext) {
    if (!instance.config.getLatestScanFindings) return;

    const accountEntity = getAccountEntity(instance);
    const serviceEntity = getServiceEntity(instance);

    const client = createServicesClient(instance);

    await jobState.iterateEntities(
      { _type: Entities.SCAN_PROFILE._type },
      async (profileEntity) => {
        const profileEntityToken = profileEntity.token as string;

        if (profileEntityToken) {
          const report = await getLatestFullReport({
            client,
            token: profileEntityToken,
            logger,
          });

          if (!report) return;

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
