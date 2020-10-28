export const Steps = {
  ACCOUNT: 'fetch-account',
  ASSETS: 'fetch-assets',
  FINDINGS: 'fetch-findings',
  SCAN_PROFILES: 'fetch-scan-profiles',
  REPORTS: 'fetch-reports',
};

export const Entities = {
  ACCOUNT: { _type: 'detectify_account' },
  SERVICE: { _type: 'detectify_service' },
  WEB_APP_DOMAIN: { _type: 'web_app_domain' },
  WEB_APP_ENDPOINT: { _type: 'web_app_endpoint' },
  SCAN_PROFILE: { _type: 'detectify_scan_profile' },
  REPORT: { _type: 'detectify_scan' },
  FINDING: { _type: 'detectify_finding' },
};
