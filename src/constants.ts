import { RelationshipClass } from '@jupiterone/integration-sdk-core';

export const Steps = {
  ACCOUNT: 'fetch-account',
  ASSETS: 'fetch-assets',
  FINDINGS: 'fetch-findings',
  SCAN_PROFILES: 'fetch-scan-profiles',
  REPORTS: 'fetch-reports',
  USERS: 'fetch-users',
};

export const Entities = {
  ACCOUNT: {
    resourceName: 'Account',
    _type: 'detectify_account',
    _class: ['Account'],
  },
  SERVICE: {
    resourceName: 'Service',
    _type: 'detectify_service',
    _class: ['Service'],
  },
  WEB_APP_DOMAIN: {
    resourceName: 'Asset (Domain)',
    _type: 'web_app_domain',
    _class: ['Application'],
  },
  WEB_APP_ENDPOINT: {
    resourceName: 'Asset (Subdomain)',
    _type: 'web_app_endpoint',
    _class: ['ApplicationEndpoint'],
  },
  SCAN_PROFILE: {
    resourceName: 'Scan Profile',
    _type: 'detectify_scan_profile',
    _class: ['Configuration'],
  },
  FINDING: {
    resourceName: 'Finding',
    _type: 'detectify_finding',
    _class: ['Finding'],
  },
  REPORT: {
    resourceName: 'Scan Report',
    _type: 'detectify_scan',
    _class: ['Assessment'],
  },
  USER: {
    resourceName: 'User',
    _type: 'detectify_user',
    _class: ['User'],
  },
};

export const Relationships = {
  ACCOUNT_PROVIDES_SERVICE: {
    _type: 'detectify_account_provides_service',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.PROVIDES,
    targetType: Entities.SERVICE._type,
  },
  ACCOUNT_HAS_DOMAIN: {
    _type: 'detectify_account_has_web_app_domain',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.WEB_APP_DOMAIN._type,
  },
  DOMAIN_HAS_SCAN_PROFILE: {
    _type: 'web_app_domain_has_detectify_scan_profile',
    sourceType: Entities.WEB_APP_DOMAIN._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.SCAN_PROFILE._type,
  },
  DOMAIN_HAS_SUBDOMAIN: {
    _type: 'web_app_domain_has_endpoint',
    sourceType: Entities.WEB_APP_DOMAIN._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.WEB_APP_ENDPOINT._type,
  },
  ACCOUNT_HAS_REPORT: {
    _type: 'detectify_account_has_scan',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.REPORT._type,
  },
  SERVICE_PERFORMED_REPORT: {
    _type: 'detectify_service_performed_scan',
    sourceType: Entities.SERVICE._type,
    _class: RelationshipClass.PERFORMED,
    targetType: Entities.REPORT._type,
  },
  ENDPOINT_HAS_FINDING: {
    _type: 'web_app_endpoint_has_detectify_finding',
    sourceType: Entities.WEB_APP_ENDPOINT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.FINDING._type,
  },
  REPORT_IDENTIFIED_FINDING: {
    _type: 'detectify_scan_identified_finding',
    sourceType: Entities.REPORT._type,
    _class: RelationshipClass.IDENTIFIED,
    targetType: Entities.FINDING._type,
  },
  SERVICE_SCANS_DOMAIN: {
    _type: 'detectify_service_scans_web_app_domain',
    sourceType: Entities.SERVICE._type,
    _class: RelationshipClass.SCANS,
    targetType: Entities.WEB_APP_DOMAIN._type,
  },
  ACCOUNT_HAS_USER: {
    _type: 'detectify_account_has_user',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.USER._type,
  },
};
