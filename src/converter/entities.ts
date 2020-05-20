/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createIntegrationEntity,
  getTime,
  convertProperties,
} from '@jupiterone/integration-sdk';
import {
  getHostnameFromUrl,
  getCVSS3Severity,
  getCVSS2Severity,
} from './utils';

export const convertDomain = (
  data: any,
): ReturnType<typeof createIntegrationEntity> =>
  createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: `detectify-asset:${data.name}`,
        _type: 'detectify_asset',
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
        _key: `detectify-endpoint:${data.name}`,
        _type: 'detectify_endpoint',
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
