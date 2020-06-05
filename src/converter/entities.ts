/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createIntegrationEntity,
  getTime,
  convertProperties,
  Entity,
} from '@jupiterone/integration-sdk-core';
import {
  getHostnameFromUrl,
  getCVSS3Severity,
  getCVSS2Severity,
  buildReportSummary,
} from './utils';

export const getAccountEntity = (instance: any): Entity => ({
  _key: `detectify:account:${instance.id}`,
  _type: 'detectify_account',
  _class: ['Account'],
  name: instance.name,
  displayName: instance.name,
  description: instance.description,
});

export const getServiceEntity = (instance: any): Entity => ({
  _key: `detectify:service:${instance.id}:mast`,
  _type: 'detectify_service',
  _class: ['Service'],
  name: 'Detectify DAST',
  displayName: 'Detectify DAST',
  description: 'Dynamic Application Security Testing (MAST)',
  category: 'software',
  function: 'DAST',
});

export const convertDomain = (
  data: any,
): ReturnType<typeof createIntegrationEntity> =>
  createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: `web-app-domain:${data.name}`,
        _type: 'web_app_domain',
        _class: ['Application'],
        displayName: data.name,
        createdOn: getTime(data.created),
        updatedOn: getTime(data.updated),
        status: data.status,
        token: data.token,
        monitored: data.monitored,
      },
    },
  });

export const convertSubdomain = (
  data: any,
): ReturnType<typeof createIntegrationEntity> =>
  createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: `web-app-endpoint:${data.name}`,
        _type: 'web_app_endpoint',
        _class: ['ApplicationEndpoint'],
        name: data.name,
        displayName: data.name,
        address: data.name,
        createdOn: getTime(data.discovered),
        updatedOn: getTime(data.updated),
        lastSeenOn: getTime(data.last_seen),
        status: data.status,
        token: data.token,
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
        _type: 'detectify_scan_profile',
        _class: ['Configuration'],
        name: data.name,
        displayName: data.name,
        endpoint: data.endpoint,
        createdOn: getTime(data.created),
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
        _type: 'detectify_scan',
        _class: ['Assessment'],
        name: data.scan_profile_name,
        displayName: data.scan_profile_name,
        category: 'Vulnerability Scan',
        summary: buildReportSummary(data),
        endpoint: data.endpoint,
        createdOn: getTime(data.created),
        startedOn: getTime(data.started),
        stoppedOn: getTime(data.stopped),
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
        _type: 'detectify_finding',
        _class: ['Finding'],
        name: data.title,
        displayName: data.title,
        category: 'app-scan',
        description: data.definition?.description,
        endpoint: data.found_at?.startsWith('http')
          ? getHostnameFromUrl(data.found_at)
          : data.found_at,
        createdOn: getTime(data.start_timestamp),
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
