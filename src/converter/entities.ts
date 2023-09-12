import {
  createIntegrationEntity,
  convertProperties,
  Entity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import {
  getHostnameFromUrl,
  getCVSS3Severity,
  getCVSS2Severity,
  buildReportSummary,
} from './utils';
import { Entities } from '../constants';

export function buildAccountEntityKey(integrationInstanceId: string) {
  return `detectify:account:${integrationInstanceId}`;
}

export const getAccountEntity = (instance: any): Entity => ({
  _key: buildAccountEntityKey(instance.id),
  _type: Entities.ACCOUNT._type,
  _class: Entities.ACCOUNT._class,
  name: instance.name,
  displayName: instance.name,
  description: instance.description,
});

export function buildServiceEntityKey(integrationInstanceId: string) {
  return `detectify:service:${integrationInstanceId}:mast`;
}

export const getServiceEntity = (instance: any): Entity => ({
  _key: buildServiceEntityKey(instance.id),
  _type: Entities.SERVICE._type,
  _class: Entities.SERVICE._class,
  name: 'Detectify DAST',
  displayName: 'Detectify DAST',
  description: 'Dynamic Application Security Testing (MAST)',
  category: 'software',
  function: 'DAST',
});

export const createDomainKey = (name: string): string => {
  return `web-app-domain:${name}`;
};

export const convertDomain = (
  data: any,
): ReturnType<typeof createIntegrationEntity> =>
  createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: createDomainKey(data.name),
        _type: Entities.WEB_APP_DOMAIN._type,
        _class: Entities.WEB_APP_DOMAIN._class,
        displayName: data.name,
        createdOn: parseTimePropertyValue(data.created),
        updatedOn: parseTimePropertyValue(data.updated),
        status: data.status,
        token: data.token,
        monitored: data.monitored,
      },
    },
  });

export function getSubdomainEntityKey(subdomainName: string) {
  return `web-app-endpoint:${subdomainName}`;
}

export const convertSubdomain = (
  data: any,
): ReturnType<typeof createIntegrationEntity> =>
  createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: getSubdomainEntityKey(data.name),
        _type: Entities.WEB_APP_ENDPOINT._type,
        _class: Entities.WEB_APP_ENDPOINT._class,
        name: data.name,
        displayName: data.name,
        address: data.name,
        createdOn: parseTimePropertyValue(data.discovered),
        updatedOn: parseTimePropertyValue(data.updated),
        lastSeenOn: parseTimePropertyValue(data.last_seen),
        status: data.status,
        token: data.token,
        addedBy: data.added_by,
      },
    },
  });

export const convertProfile = (
  data: any,
): ReturnType<typeof createIntegrationEntity> =>
  createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: `detectify-scan-profile:${data.token}`,
        _type: Entities.SCAN_PROFILE._type,
        _class: Entities.SCAN_PROFILE._class,
        name: data.name,
        displayName: data.name,
        endpoint: data.endpoint,
        createdOn: parseTimePropertyValue(data.created),
        status: data.status,
        token: data.token,
      },
    },
  });

export const convertReport = (
  data: any,
): ReturnType<typeof createIntegrationEntity> =>
  createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: `detectify-scan:${data.token}`,
        _type: Entities.REPORT._type,
        _class: Entities.REPORT._class,
        name: data.scan_profile_name,
        displayName: data.scan_profile_name,
        category: 'Vulnerability Scan',
        summary: buildReportSummary(data),
        endpoint: data.endpoint,
        createdOn: parseTimePropertyValue(data.created),
        startedOn: parseTimePropertyValue(data.started),
        stoppedOn: parseTimePropertyValue(data.stopped),
        cvss: data.cvss,
        score: data.cvss,
        scanProfileName: data.scan_profile_name,
        scanProfileToken: data.scan_profile_token,
        highSevFindings: data.high_level_findings,
        mediumSevFindings: data.medium_level_findings,
        lowSevFindings: data.low_level_findings,
        infoFindings: data.information_findings,
        token: data.token,
        webLink: data.url,
        internal: false,
      },
    },
  });

export const convertFinding = (
  data: any,
): ReturnType<typeof createIntegrationEntity> => {
  const cvss2 = data.score?.find((item) => item.version.match(/^2/));
  const cvss3 = data.score?.find((item) => item.version.match(/^3/));

  const cvss2Score = cvss2?.score;
  const cvss2Vector = cvss2?.vector;

  const cvss3Score = cvss3?.score;
  const cvss3Vector = cvss3?.vector;

  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: `detectify-finding:${data.uuid}`,
        _type: Entities.FINDING._type,
        _class: Entities.FINDING._class,
        name: data.title,
        displayName: data.title,
        category: 'app-scan',
        description: data.definition?.description,
        endpoint: data.found_at?.startsWith('http')
          ? getHostnameFromUrl(data.found_at)
          : data.found_at,
        createdOn: parseTimePropertyValue(data.start_timestamp),
        details: data.details?.map((d) => d.value),
        references: data.definition?.references?.map((r) => r.link),
        cvss2Score,
        cvss2Vector,
        cvss3Score,
        cvss3Vector,
        score: cvss3Score || cvss2Score,
        vector: cvss3Vector || cvss2Vector,
        numericSeverity: cvss3Score || cvss2Score,
        severity:
          getCVSS3Severity(cvss3Score) ||
          getCVSS2Severity(cvss2Score) ||
          'unknown',
        webLink: data.url,
        open: true,
      },
    },
  });
};
